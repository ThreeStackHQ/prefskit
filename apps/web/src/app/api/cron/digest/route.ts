import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");

  // Constant-time comparison to prevent timing attacks
  const expected = Buffer.from(env.CRON_SECRET);
  const provided = Buffer.from(token);

  if (
    expected.length !== provided.length ||
    !timingSafeEqual(expected, provided)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Process weekly digest
  // In production: query subscribers, generate email digests, send via Resend
  return NextResponse.json({ success: true, message: "Digest processed" });
}
