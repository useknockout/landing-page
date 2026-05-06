import { NextResponse, type NextRequest } from "next/server";

/**
 * Playground proxy — forwards an image upload to the Modal API and returns the
 * processed result + metadata. Uses the server-only KNOCKOUT_BETA_TOKEN so the
 * raw token never reaches the browser.
 *
 * Per-IP rate limit: 60 req/min (in-memory, fine for low-volume beta — swap to
 * Vercel KV / Upstash before scaling).
 */
export const runtime = "nodejs";
export const maxDuration = 60;

const MODAL_BASE = process.env.MODAL_API_BASE ?? "https://useknockout--api.modal.run";
const RATE_LIMIT_PER_IP = 60;
const RATE_LIMIT_WINDOW_MS = 60_000;

type RateBucket = { count: number; resetAt: number };
const ipBuckets = new Map<string, RateBucket>();

function checkRateLimit(ip: string): {
  ok: boolean;
  retryAfter?: number;
  remaining: number;
} {
  const now = Date.now();
  const bucket = ipBuckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    ipBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { ok: true, remaining: RATE_LIMIT_PER_IP - 1 };
  }
  if (bucket.count >= RATE_LIMIT_PER_IP) {
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      remaining: 0,
    };
  }
  bucket.count++;
  return { ok: true, remaining: RATE_LIMIT_PER_IP - bucket.count };
}

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  const token = process.env.KNOCKOUT_BETA_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "playground_not_configured" }, { status: 503 });
  }

  const ip = clientIp(request);
  const limit = checkRateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "rate_limit_exceeded", retry_after_s: limit.retryAfter },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfter ?? 60),
          "x-ratelimit-limit": String(RATE_LIMIT_PER_IP),
          "x-ratelimit-remaining": "0",
        },
      },
    );
  }

  const url = new URL(request.url);
  const endpoint = url.searchParams.get("endpoint") ?? "/remove";
  if (!isAllowedEndpoint(endpoint)) {
    return NextResponse.json({ error: "endpoint_not_allowed" }, { status: 400 });
  }

  // Pass the multipart body through unchanged.
  const upstream = await fetch(`${MODAL_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Forward content-type so Modal sees the multipart boundary.
      "Content-Type": request.headers.get("content-type") ?? "application/octet-stream",
    },
    body: request.body,
    // @ts-expect-error duplex is required for streaming bodies in Node 18+
    duplex: "half",
  });

  // Return the binary image straight back. Surface latency + model headers.
  const passthrough = new Headers();
  for (const h of ["x-knockout-latency", "x-knockout-model", "content-type"]) {
    const v = upstream.headers.get(h);
    if (v) passthrough.set(h, v);
  }
  passthrough.set("x-ratelimit-limit", String(RATE_LIMIT_PER_IP));
  passthrough.set("x-ratelimit-remaining", String(limit.remaining));

  return new Response(upstream.body, {
    status: upstream.status,
    headers: passthrough,
  });
}

const ALLOWED_ENDPOINTS = new Set([
  "/remove",
  "/remove-url",
  "/replace-bg",
  "/sticker",
  "/outline",
  "/mask",
  "/smart-crop",
  "/shadow",
  "/studio-shot",
  "/headshot",
  "/upscale",
  "/face-restore",
  "/preview",
  "/compare",
]);

function isAllowedEndpoint(endpoint: string): boolean {
  return ALLOWED_ENDPOINTS.has(endpoint);
}
