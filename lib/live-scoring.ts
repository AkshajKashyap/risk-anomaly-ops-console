import { prisma } from "@/lib/prisma";
import {
  scoreAnomalyEvent,
  scoreRiskEvent,
  type AnomalyInferenceResult,
  type RiskInferenceResult,
} from "@/lib/ml-clients";

export type LiveScoringResult = {
  eventId: string;
  externalId: string | null;
  flagged: boolean;
  risk: RiskInferenceResult;
  anomaly: AnomalyInferenceResult;
};

function toJsonValue(value: unknown) {
  return JSON.parse(JSON.stringify(value ?? null));
}

export async function scoreAndPersistEventById(
  eventId: string,
): Promise<LiveScoringResult> {
  const event = await prisma.eventItem.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  const [risk, anomaly] = await Promise.all([
    scoreRiskEvent(event),
    scoreAnomalyEvent(event),
  ]);

  if (risk.ok) {
    await prisma.modelPrediction.upsert({
      where: { eventId: event.id },
      update: {
        modelName: risk.modelName,
        modelVersion: risk.modelVersion,
        score: risk.score,
        confidence: risk.confidence,
        threshold: risk.threshold,
        explanation: toJsonValue(risk.explanation),
        latencyMs: risk.latencyMs ?? null,
        createdAt: new Date(),
      },
      create: {
        eventId: event.id,
        modelName: risk.modelName,
        modelVersion: risk.modelVersion,
        score: risk.score,
        confidence: risk.confidence,
        threshold: risk.threshold,
        explanation: toJsonValue(risk.explanation),
        latencyMs: risk.latencyMs ?? null,
      },
    });
  }

  if (anomaly.ok) {
    await prisma.anomalyOutput.upsert({
      where: { eventId: event.id },
      update: {
        modelName: anomaly.modelName,
        modelVersion: anomaly.modelVersion,
        score: anomaly.score,
        threshold: anomaly.threshold,
        details: toJsonValue(anomaly.details),
        latencyMs: anomaly.latencyMs ?? null,
        createdAt: new Date(),
      },
      create: {
        eventId: event.id,
        modelName: anomaly.modelName,
        modelVersion: anomaly.modelVersion,
        score: anomaly.score,
        threshold: anomaly.threshold,
        details: toJsonValue(anomaly.details),
        latencyMs: anomaly.latencyMs ?? null,
      },
    });
  }

  let nextFlagged = event.flagged;

  if (risk.ok || anomaly.ok) {
    const riskFlag =
      risk.ok && risk.threshold !== null ? risk.score >= risk.threshold : false;

    const anomalyFlag =
      anomaly.ok && anomaly.threshold !== null
        ? anomaly.score >= anomaly.threshold
        : false;

    nextFlagged = riskFlag || anomalyFlag;

    await prisma.eventItem.update({
      where: { id: event.id },
      data: { flagged: nextFlagged },
    });
  }

  return {
    eventId: event.id,
    externalId: event.externalId,
    flagged: nextFlagged,
    risk,
    anomaly,
  };
}

export async function createAndScoreDemoEvent() {
  const now = Date.now();
  const countries = ["US", "CA", "GB", "DE", "IN", "BR"];
  const eventTypes = [
    "card_charge",
    "wire_transfer",
    "login_attempt",
    "account_update",
  ];
  const sources = ["transactions", "identity", "payments"];

  const velocityBucket = now % 4;
  const amount = Number((40 + (now % 300) + velocityBucket * 17.35).toFixed(2));

  const created = await prisma.eventItem.create({
    data: {
      externalId: `evt_live_${now}`,
      source: sources[now % sources.length],
      eventType: eventTypes[now % eventTypes.length],
      amount,
      country: countries[now % countries.length],
      occurredAt: new Date(),
      flagged: false,
      payload: {
        merchant: `merchant_live_${now % 10000}`,
        ipAddress: `10.0.${now % 255}.${(now >> 8) % 255}`,
        deviceId: `device_live_${now % 1000}`,
        velocityBucket,
      },
    },
    select: { id: true },
  });

  return scoreAndPersistEventById(created.id);
}
