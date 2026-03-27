import path from "node:path";

function requireEnv(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`${name} is not set`);
  }

  return value;
}

export const mlConfig = {
  riskServiceUrl: requireEnv("RISK_SERVICE_URL", "http://127.0.0.1:8001"),
  anomalyServiceUrl: requireEnv("ANOMALY_SERVICE_URL", "http://127.0.0.1:8002"),
  anomalyFeatureSchemaPath: requireEnv(
    "ANOMALY_FEATURE_SCHEMA_PATH",
    path.join(process.cwd(), "artifacts", "feature_schema.json"),
  ),
  anomalyModel: process.env.ANOMALY_MODEL ?? "iforest",
  requestTimeoutMs: Number(process.env.ML_REQUEST_TIMEOUT_MS ?? "5000"),
};
