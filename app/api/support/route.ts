import { NextResponse, type NextRequest } from "next/server";

/**
 * Support contact form -> email via Resend.
 *
 * The dashboard "Support" link used to be a bare `mailto:` which silently fails
 * for users whose browser/Workspace blocks the mailto handoff (GitHub issue #2:
 * paid customer hit Google "ServiceNotAllowed"). This route + the /support page
 * give a reliable path that never depends on a local mail client.
 *
 * Requires env RESEND_API_KEY. Optional: SUPPORT_TO_EMAIL, SUPPORT_FROM_EMAIL.
 * The from-address domain must be verified in Resend (useknockout.com already is
 * for auth emails). Without RESEND_API_KEY the route returns 503 and the page
 * falls back to the copyable address + GitHub issues link.
 */
export const runtime = "nodejs";
export const maxDuration = 15;

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const TO_EMAIL = process.env.SUPPORT_TO_EMAIL ?? "hi@useknockout.com";
const FROM_EMAIL =
  process.env.SUPPORT_FROM_EMAIL ?? "useknockout support <noreply@useknockout.com>";

const SUBJECT_MAX = 200;
const MESSAGE_MAX = 5000;

// Per-IP rate limit: 5 submissions / 10 min (in-memory — fine for low volume;
// swap to Vercel KV / Upstash before scaling).
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60_000;
type Bucket = { count: number; resetAt: number };
const ipBuckets = new Map<string, Bucket>();

function checkRateLimit(ip: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const bucket = ipBuckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    ipBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { ok: true };
  }
  if (bucket.count >= RATE_LIMIT) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  bucket.count++;
  return { ok: true };
}

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const { email, subject, message, company } = body as Record<string, unknown>;

  // Honeypot: real users never fill the hidden "company" field. Pretend success
  // so bots don't learn they were caught.
  if (typeof company === "string" && company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  if (!isEmail(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  if (typeof subject !== "string" || !subject.trim() || subject.length > SUBJECT_MAX) {
    return NextResponse.json({ error: "invalid_subject" }, { status: 400 });
  }
  if (typeof message !== "string" || !message.trim() || message.length > MESSAGE_MAX) {
    return NextResponse.json({ error: "invalid_message" }, { status: 400 });
  }

  const ip = clientIp(request);
  const limit = checkRateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "rate_limit_exceeded", retry_after_s: limit.retryAfter },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter ?? 600) } },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "support_not_configured" }, { status: 503 });
  }

  const upstream = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      reply_to: email,
      subject: `[Support] ${subject.trim().slice(0, SUBJECT_MAX)}`,
      text: `From: ${email}\nIP: ${ip}\n\n${message.trim()}`,
    }),
  });

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    console.error("support: resend send failed", upstream.status, detail);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
