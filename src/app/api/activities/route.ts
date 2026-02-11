import { NextRequest, NextResponse } from "next/server";
import { getActivities, initDb } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await initDb();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const type = searchParams.get("type") || undefined;

    const activities = await getActivities(limit, type);

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Activities API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
