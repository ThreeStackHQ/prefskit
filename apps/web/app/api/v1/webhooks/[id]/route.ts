import { type NextRequest, NextResponse } from "next/server";
import { db, webhookEndpoints, webhookDeliveries } from "@prefskit/db";
import { eq, and } from "@prefskit/db";
import { authenticateApiKey, isAuthError } from "@/lib/api-auth";

interface RouteParams {
  params: { id: string };
}

// GET /api/v1/webhooks/:id/deliveries
export async function GET(req: NextRequest, { params }: RouteParams) {
  const auth = await authenticateApiKey(req);
  if (isAuthError(auth)) return auth;

  if (auth.plan !== "pro") {
    return NextResponse.json(
      { error: "Webhooks are a Pro plan feature" },
      { status: 403 },
    );
  }

  // Verify endpoint belongs to workspace
  const endpoint = await db.query.webhookEndpoints.findFirst({
    where: and(
      eq(webhookEndpoints.id, params.id),
      eq(webhookEndpoints.workspaceId, auth.workspaceId),
    ),
  });

  if (!endpoint) {
    return NextResponse.json(
      { error: "Webhook endpoint not found" },
      { status: 404 },
    );
  }

  const { searchParams } = req.nextUrl;
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)),
  );

  const deliveries = await db.query.webhookDeliveries.findMany({
    where: eq(webhookDeliveries.endpointId, params.id),
    orderBy: (d, { desc }) => [desc(d.createdAt)],
    limit,
  });

  return NextResponse.json({
    endpoint: { ...endpoint, secret: `${endpoint.secret.slice(0, 8)}...` },
    deliveries,
  });
}

// DELETE /api/v1/webhooks/:id
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const auth = await authenticateApiKey(req);
  if (isAuthError(auth)) return auth;

  if (auth.plan !== "pro") {
    return NextResponse.json(
      { error: "Webhooks are a Pro plan feature" },
      { status: 403 },
    );
  }

  const endpoint = await db.query.webhookEndpoints.findFirst({
    where: and(
      eq(webhookEndpoints.id, params.id),
      eq(webhookEndpoints.workspaceId, auth.workspaceId),
    ),
  });

  if (!endpoint) {
    return NextResponse.json(
      { error: "Webhook endpoint not found" },
      { status: 404 },
    );
  }

  await db
    .delete(webhookEndpoints)
    .where(
      and(
        eq(webhookEndpoints.id, params.id),
        eq(webhookEndpoints.workspaceId, auth.workspaceId),
      ),
    );

  return NextResponse.json({ success: true });
}
