import { mlConfig } from "@/lib/ml-config";
import { appendInferenceLog } from "@/lib/inference-log";
import {
  buildAnomalyRequestFromEvent,
  buildRiskRequestFromEvent,
  type EventForScoring,
} from "@/lib/ml-adapters";

export type RiskInferenceResult =
  | {
      ok: true;
      modelName: string;
      modelVersion: string;
      score: number;
      confidence: number | null;
      threshold: number | null;
      latencyMs: number | null;
      explanation: Record<string, unknown>;
      raw: unknown;
    }
  | {
      ok: false;
      error: string;
      latencyMs: number | null;
      raw: unknown | null;
    };

export type AnomalyInferenceResult =
  | {
      ok: true;
      modelName: string;
      modelVersion: string;
      score: number;
      threshold: number | null;
      latencyMs: number | null;
      details: Record<string, unknown>;
      raw: unknown;
    }
  | {
      ok: false;
      error: string;
      latencyMs: number | null;
      raw: unknown | null;
    };

async function fetchWithTimeout(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), mlConfig.requestTimeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
  }
}

function formatErrorBody(body: unknown) {
  if (typeof body === "string") return body;

  if (body && typeof body === "object") {
    const maybeDetail = (body as Record<string, unknown>).detail;
    if (typeof maybeDetail === "string") return maybeDetail;
    return JSON.stringify(body);
  }

  return "unknown_error";
}

export async function scoreRiskEvent(event: EventForScoring): Promise<RiskInferenceResult> {
  const startedAt = Date.now();
  const payload = buildRiskRequestFromEvent(event);

  try {
    const response = await fetchWithTimeout(`${mlConfig.riskServiceUrl}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const raw = await response.json().catch(() => null);
    const elapsed = Date.now() - startedAt;

    if (!response.ok) {
      const error = `risk_service_${response.status}: ${formatErrorBody(raw)}`;

      await appendInferenceLog({
        eventId: event.id,
        externalId: event.externalId,
        service: "risk",
        ok: false,
        latencyMs: elapsed,
        error,
      });

      return {
        ok: false,
        error,
        latencyMs: elapsed,
        raw,
      };
    }

    const result: RiskInferenceResult = {
      ok: true,
      modelName: "churn_ensemble_risk",
      modelVersion:
        typeof (raw as Record<string, unknown>)?.model_version === "string"
          ? ((raw as Record<string, unknown>).model_version as string)
          : "unknown",
      score: Number((raw as Record<string, unknown>)?.prob_churn ?? 0),
      confidence:
        typeof (raw as Record<string, unknown>)?.confidence === "number"
          ? Number((raw as Record<string, unknown>).confidence)
          : null,
      threshold:
        typeof (raw as Record<string, unknown>)?.threshold === "number"
          ? Number((raw as Record<string, unknown>).threshold)
          : null,
      latencyMs:
        typeof (raw as Record<string, unknown>)?.latency_ms === "number"
          ? Math.round(Number((raw as Record<string, unknown>).latency_ms))
          : elapsed,
      explanation: {
        sourceService: "risk",
        adapter: "telecom_churn_adapter",
        predChurn: Number((raw as Record<string, unknown>)?.pred_churn ?? 0),
      },
      raw,
    };

    await appendInferenceLog({
      eventId: event.id,
      externalId: event.externalId,
      service: "risk",
      ok: true,
      latencyMs: result.latencyMs,
      score: result.score,
      threshold: result.threshold,
      modelVersion: result.modelVersion,
    });

    return result;
  } catch (error) {
    const elapsed = Date.now() - startedAt;
    const message = error instanceof Error ? error.message : "unknown_error";

    await appendInferenceLog({
      eventId: event.id,
      externalId: event.externalId,
      service: "risk",
      ok: false,
      latencyMs: elapsed,
      error: message,
    });

    return {
      ok: false,
      error: message,
      latencyMs: elapsed,
      raw: null,
    };
  }
}

export async function scoreAnomalyEvent(
  event: EventForScoring,
): Promise<AnomalyInferenceResult> {
  const startedAt = Date.now();
  const payload = await buildAnomalyRequestFromEvent(event);

  try {
    const response = await fetchWithTimeout(`${mlConfig.anomalyServiceUrl}/score_batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const raw = await response.json().catch(() => null);
    const elapsed = Date.now() - startedAt;

    if (!response.ok) {
      const error = `anomaly_service_${response.status}: ${formatErrorBody(raw)}`;

      await appendInferenceLog({
        eventId: event.id,
        externalId: event.externalId,
        service: "anomaly",
        ok: false,
        latencyMs: elapsed,
        error,
      });

      return {
        ok: false,
        error,
        latencyMs: elapsed,
        raw,
      };
    }

    const health = await fetchWithTimeout(`${mlConfig.anomalyServiceUrl}/health`, {
      method: "GET",
    })
      .then((res) => res.json())
      .catch(() => null);

    const rows = Array.isArray((raw as Record<string, unknown>)?.rows)
      ? ((raw as Record<string, unknown>).rows as Array<Record<string, unknown>>)
      : [];

    const row = rows[0] ?? null;
    const nFeatures =
      health && typeof (health as Record<string, unknown>)?.n_features === "number"
        ? Number((health as Record<string, unknown>).n_features)
        : null;

    const result: AnomalyInferenceResult = {
      ok: true,
      modelName:
        typeof (raw as Record<string, unknown>)?.model === "string"
          ? `log_anomaly_${(raw as Record<string, unknown>).model as string}`
          : `log_anomaly_${mlConfig.anomalyModel}`,
      modelVersion: nFeatures !== null ? `schema_${nFeatures}` : "service_live",
      score:
        row && typeof row.anomaly_score === "number"
          ? Number(row.anomaly_score)
          : 0,
      threshold:
        typeof (raw as Record<string, unknown>)?.threshold === "number"
          ? Number((raw as Record<string, unknown>).threshold)
          : null,
      latencyMs: elapsed,
      details: {
        sourceService: "anomaly",
        adapter: "strict_feature_schema_adapter",
        isAnomaly:
          row && typeof row.is_anomaly === "boolean" ? row.is_anomaly : false,
        nFeatures,
      },
      raw,
    };

    await appendInferenceLog({
      eventId: event.id,
      externalId: event.externalId,
      service: "anomaly",
      ok: true,
      latencyMs: result.latencyMs,
      score: result.score,
      threshold: result.threshold,
      modelVersion: result.modelVersion,
    });

    return result;
  } catch (error) {
    const elapsed = Date.now() - startedAt;
    const message = error instanceof Error ? error.message : "unknown_error";

    await appendInferenceLog({
      eventId: event.id,
      externalId: event.externalId,
      service: "anomaly",
      ok: false,
      latencyMs: elapsed,
      error: message,
    });

    return {
      ok: false,
      error: message,
      latencyMs: elapsed,
      raw: null,
    };
  }
}
