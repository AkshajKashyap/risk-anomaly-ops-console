import { NextResponse } from "next/server";
import { getOrCreateCurrentDbUser } from "@/lib/current-user";
import { scoreAndPersistEventById } from "@/lib/live-scoring";

type RouteContext = {
  params: Promise<{ eventId: string }> | { eventId: string };
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    await getOrCreateCurrentDbUser();

    const { eventId } = await Promise.resolve(context.params);
    const result = await scoreAndPersistEventById(eventId);
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
