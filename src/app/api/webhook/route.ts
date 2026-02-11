import { NextRequest, NextResponse } from "next/server";
import { logActivity, initDb } from "@/lib/db";

// Webhook API key for security
const WEBHOOK_API_KEY = process.env.WEBHOOK_API_KEY;

export async function POST(request: NextRequest) {
  // Verify API key
  const apiKey = request.headers.get("x-api-key");
  if (!WEBHOOK_API_KEY || apiKey !== WEBHOOK_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, title, description, metadata } = body;

    if (!type || !title) {
      return NextResponse.json(
        { error: "Missing required fields: type, title" },
        { status: 400 }
      );
    }

    // Ensure tables exist
    await initDb();

    // Log the activity
    await logActivity(type, title, description, metadata);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}
