import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  ReviewStatus,
  FeedbackLabelType,
} from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.feedbackLabel.deleteMany();
  await prisma.reviewDecision.deleteMany();
  await prisma.anomalyOutput.deleteMany();
  await prisma.modelPrediction.deleteMany();
  await prisma.eventItem.deleteMany();
  await prisma.user.deleteMany();

  const demoUser = await prisma.user.create({
    data: {
      clerkUserId: "user_demo_clerk_001",
      email: "demo-reviewer@example.com",
      name: "Demo Reviewer",
    },
  });

  const countries = ["US", "CA", "GB", "DE", "IN", "BR"];
  const eventTypes = ["card_charge", "wire_transfer", "login_attempt", "account_update"];
  const sources = ["transactions", "identity", "payments"];

  const createdEvents: { id: string }[] = [];

  for (let i = 1; i <= 24; i++) {
    const flagged = i % 3 === 0 || i % 5 === 0;

    const event = await prisma.eventItem.create({
      data: {
        externalId: `evt_${String(i).padStart(4, "0")}`,
        source: sources[i % sources.length],
        eventType: eventTypes[i % eventTypes.length],
        amount: Number((40 + i * 17.35).toFixed(2)),
        country: countries[i % countries.length],
        occurredAt: new Date(Date.now() - i * 60 * 60 * 1000),
        flagged,
        payload: {
          merchant: `merchant_${i}`,
          ipAddress: `192.168.1.${i}`,
          deviceId: `device_${i}`,
          velocityBucket: i % 4,
        },
      },
      select: { id: true },
    });

    createdEvents.push(event);

    const riskScore = Number(Math.min(0.99, 0.18 + i * 0.028).toFixed(3));
    const anomalyScore = Number(Math.min(0.99, 0.12 + i * 0.031).toFixed(3));

    await prisma.modelPrediction.create({
      data: {
        eventId: event.id,
        modelName: "xgb_risk_model",
        modelVersion: "v0.1.0",
        score: riskScore,
        confidence: Number(Math.min(0.99, 0.65 + i * 0.01).toFixed(3)),
        threshold: 0.72,
        explanation: {
          topFeatures: ["country_risk", "velocity", "amount"],
          notes: flagged ? "High-risk pattern detected" : "Below alert threshold",
        },
        latencyMs: 35 + i,
      },
    });

    await prisma.anomalyOutput.create({
      data: {
        eventId: event.id,
        modelName: "iforest_anomaly",
        modelVersion: "v0.1.0",
        score: anomalyScore,
        threshold: 0.68,
        details: {
          zScore: Number((1.2 + i * 0.08).toFixed(2)),
          cluster: i % 5,
        },
        latencyMs: 20 + i,
      },
    });
  }

  for (let i = 0; i < createdEvents.length; i++) {
    const eventId = createdEvents[i].id;

    if (i < 8) {
      await prisma.reviewDecision.create({
        data: {
          eventId,
          reviewerId: demoUser.id,
          status:
            i % 4 === 0
              ? ReviewStatus.APPROVED
              : i % 4 === 1
              ? ReviewStatus.REJECTED
              : i % 4 === 2
              ? ReviewStatus.ESCALATED
              : ReviewStatus.PENDING,
          note: `Seed review note ${i + 1}`,
        },
      });
    }

    if (i < 10) {
      await prisma.feedbackLabel.create({
        data: {
          eventId,
          reviewerId: demoUser.id,
          label:
            i % 4 === 0
              ? FeedbackLabelType.TRUE_POSITIVE
              : i % 4 === 1
              ? FeedbackLabelType.FALSE_POSITIVE
              : i % 4 === 2
              ? FeedbackLabelType.BENIGN
              : FeedbackLabelType.NEEDS_MORE_INFO,
        },
      });
    }
  }

  console.log("Seed complete");
  console.log(`Created user: ${demoUser.email}`);
  console.log(`Created events: ${createdEvents.length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
