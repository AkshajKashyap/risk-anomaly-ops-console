import { NextResponse } from "next/server";
import { getOrCreateCurrentDbUser } from "@/lib/current-user";
import { createAndScoreDemoEvent } from "@/lib/live-scoring";

export async function POST() {
  try {
    await getOrCreateCurrentDbUser();

    const result = await createAndScoreDemoEvent();
    const bothFailed = !result.risk.ok && !result.anomaly.ok;

    return NextResponse.json(result, {
      status: bothFailed ? 502 : 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    const status = message === "Unauthorized" ? 401 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
