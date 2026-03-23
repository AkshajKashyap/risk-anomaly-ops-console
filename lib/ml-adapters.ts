import { readFile } from "node:fs/promises";
import { mlConfig } from "@/lib/ml-config";

export type EventForScoring = {
  id: string;
  externalId: string | null;
  source: string;
  eventType: string;
  amount: number | null;
  country: string | null;
  occurredAt: Date;
  payload: unknown;
  flagged?: boolean;
};

function payloadRecord(payload: unknown): Record<string, unknown> {
  if (typeof payload === "object" && payload !== null && !Array.isArray(payload)) {
    return payload as Record<string, unknown>;
  }

  return {};
}

function toFiniteNumber(value: unknown, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function stableHash(value: string) {
  let hash = 0;

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  return Number(((hash % 1000) / 1000).toFixed(4));
}

export function buildRiskRequestFromEvent(event: EventForScoring) {
  const payload = payloadRecord(event.payload);
  const amount = clamp(toFiniteNumber(event.amount, 60), 20, 2000);
  const velocityBucket = clamp(toFiniteNumber(payload.velocityBucket, 1), 0, 4);
  const tenure = clamp(Math.round(amount / 10 + velocityBucket * 6), 0, 72);
  const monthlyCharges = Number(clamp(amount, 20, 120).toFixed(2));
  const totalCharges = Number((monthlyCharges * Math.max(1, tenure)).toFixed(2)).toFixed(2);

  return {
    record: {
      gender: velocityBucket % 2 === 0 ? "Female" : "Male",
      SeniorCitizen: velocityBucket >= 3 ? 1 : 0,
      Partner: ["US", "CA", "GB"].includes(event.country ?? "") ? "Yes" : "No",
      Dependents: velocityBucket >= 2 ? "Yes" : "No",
      tenure,
      PhoneService: "Yes",
      MultipleLines: event.source === "payments" ? "Yes" : "No",
      InternetService: event.eventType === "login_attempt" ? "Fiber optic" : "DSL",
      OnlineSecurity: event.flagged ? "No" : "Yes",
      OnlineBackup: velocityBucket >= 1 ? "Yes" : "No",
      DeviceProtection: payload.deviceId ? "Yes" : "No",
      TechSupport: event.eventType === "account_update" ? "Yes" : "No",
      StreamingTV: "No",
      StreamingMovies: "No",
      Contract: velocityBucket >= 3 ? "Month-to-month" : "One year",
      PaperlessBilling: "Yes",
      PaymentMethod:
        event.source === "transactions"
          ? "Electronic check"
          : "Bank transfer (automatic)",
      MonthlyCharges: monthlyCharges,
      TotalCharges: totalCharges,
    },
  };
}

let cachedFeatureColumns: string[] | null = null;

export async function getAnomalyFeatureColumns(): Promise<string[]> {
  if (cachedFeatureColumns !== null) {
    return cachedFeatureColumns;
  }

  const raw = await readFile(mlConfig.anomalyFeatureSchemaPath, "utf8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed.feature_columns) || parsed.feature_columns.length === 0) {
    throw new Error(
      `feature_columns missing or empty in ${mlConfig.anomalyFeatureSchemaPath}`,
    );
  }

  const columns = parsed.feature_columns.map((value: unknown) => String(value));
  cachedFeatureColumns = columns;
  return columns;
}

function deriveFeatureValue(
  featureName: string,
  event: EventForScoring,
  payload: Record<string, unknown>,
) {
  const name = featureName.toLowerCase();
  const amount = clamp(toFiniteNumber(event.amount, 0), 0, 5000);
  const velocityBucket = clamp(toFiniteNumber(payload.velocityBucket, 0), 0, 4);
  const hour = new Date(event.occurredAt).getUTCHours();
  const weekday = new Date(event.occurredAt).getUTCDay();

  if (name.includes("velocity")) return velocityBucket;
  if (name.includes("hour")) return hour;
  if (name.includes("weekday") || name.includes("dayofweek")) return weekday;
  if (name.includes("count") || name.includes("cnt") || name.includes("events") || name.includes("num")) {
    return 1 + velocityBucket;
  }
  if (name.includes("ratio") || name.includes("rate") || name.includes("frac")) {
    return Number((velocityBucket / 4).toFixed(4));
  }
  if (name.includes("mean") || name.includes("avg")) return amount;
  if (name.includes("max")) return amount;
  if (name.includes("min")) return Number((amount / 2).toFixed(4));
  if (name.includes("std") || name.includes("var")) return Number((amount / 10).toFixed(4));
  if (name.includes("entropy")) return Number((0.25 * (velocityBucket + 1)).toFixed(4));
  if (name.includes("amount") || name.includes("charge") || name.includes("value")) return amount;
  if (name.includes("merchant")) return stableHash(String(payload.merchant ?? ""));
  if (name.includes("device")) return stableHash(String(payload.deviceId ?? ""));
  if (name.includes("ip")) return stableHash(String(payload.ipAddress ?? ""));
  if (name.includes("country")) return stableHash(String(event.country ?? "unknown"));
  if (name.includes("source")) return stableHash(event.source);
  if (name.includes("type")) return stableHash(event.eventType);
  if (name.includes("bucket")) return velocityBucket;

  return 0;
}

export async function buildAnomalyRequestFromEvent(event: EventForScoring) {
  const payload = payloadRecord(event.payload);
  const featureColumns = await getAnomalyFeatureColumns();

  const features = Object.fromEntries(
    featureColumns.map((column) => [
      column,
      deriveFeatureValue(column, event, payload),
    ]),
  );

  return {
    model: mlConfig.anomalyModel,
    rows: [
      {
        group: event.externalId ?? event.id,
        window_start: event.occurredAt.toISOString(),
        features,
      },
    ],
  };
}
