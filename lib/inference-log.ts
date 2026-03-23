import { appendFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const LOG_PATH = resolve(process.cwd(), "logs", "inference.jsonl");

export async function appendInferenceLog(entry: Record<string, unknown>) {
  try {
    await mkdir(dirname(LOG_PATH), { recursive: true });
    await appendFile(
      LOG_PATH,
      `${JSON.stringify({ ts: new Date().toISOString(), ...entry })}\n`,
      "utf8",
    );
  } catch (error) {
    console.error("Failed to write inference log", error);
  }
}
