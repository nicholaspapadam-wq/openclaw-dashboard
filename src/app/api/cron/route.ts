import { NextRequest, NextResponse } from "next/server";
import { saveCronSnapshot, getLatestCronSnapshot, initDb } from "@/lib/db";
import { auth } from "@/auth";

const WEBHOOK_API_KEY = process.env.WEBHOOK_API_KEY?.trim();

// GET - retrieve latest cron snapshot
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await initDb();
    const snapshot = await getLatestCronSnapshot();

    if (!snapshot) {
      return NextResponse.json({ jobs: [], captured_at: null });
    }

    return NextResponse.json({
      jobs: snapshot.jobs,
      captured_at: snapshot.captured_at,
    });
  } catch (error) {
    console.error("Cron API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - save new cron snapshot (called by OpenClaw sync script)
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  if (!WEBHOOK_API_KEY || apiKey !== WEBHOOK_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await initDb();

    const { jobs } = await request.json();

    if (!Array.isArray(jobs)) {
      return NextResponse.json(
        { error: "Invalid jobs format" },
        { status: 400 }
      );
    }

    await saveCronSnapshot(jobs);

    return NextResponse.json({ success: true, count: jobs.length });
  } catch (error) {
    console.error("Cron POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
