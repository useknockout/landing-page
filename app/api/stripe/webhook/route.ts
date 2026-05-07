import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Stripe webhook handler.
 * Verifies the signature manually (we don't depend on the `stripe` SDK to keep
 * cold starts fast), then dispatches on event type.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "webhook_secret_missing" }, { status: 500 });
  }

  const sigHeader = request.headers.get("stripe-signature");
  if (!sigHeader) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  if (!verifySignature(rawBody, sigHeader, secret)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  type StripeEvent = {
    id: string;
    type: string;
    data: { object: Record<string, unknown> };
  };
  let event: StripeEvent;
  try {
    event = JSON.parse(rawBody) as StripeEvent;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        // The Checkout Session object has no `items.data` — that's only on
        // subscription objects. Here we just persist the customer_id ↔ user_id
        // mapping. The follow-up `customer.subscription.created` event carries
        // the price info and is where we set tier.
        const obj = event.data.object as {
          customer?: string;
          metadata?: { user_id?: string };
        };
        const userId = obj.metadata?.user_id;
        const customerId = typeof obj.customer === "string" ? obj.customer : null;
        if (userId && customerId) {
          await supabase
            .from("users")
            .update({
              stripe_customer_id: customerId,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const obj = event.data.object as {
          customer?: string;
          metadata?: { user_id?: string };
          status?: string;
          items?: { data: { price: { id: string } }[] };
        };
        const userId = obj.metadata?.user_id;
        const customerId = typeof obj.customer === "string" ? obj.customer : null;
        const priceId = obj.items?.data?.[0]?.price?.id;

        let tier: "free" | "payg" | "volume" | "enterprise" = "free";
        if (priceId === process.env.STRIPE_PRICE_PAYG) tier = "payg";
        else if (priceId === process.env.STRIPE_PRICE_VOLUME) tier = "volume";
        // If the subscription is no longer active, drop back to free.
        if (
          obj.status === "canceled" ||
          obj.status === "incomplete_expired" ||
          obj.status === "unpaid"
        ) {
          tier = "free";
        }

        if (userId) {
          await supabase
            .from("users")
            .update({
              stripe_customer_id: customerId,
              tier,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const obj = event.data.object as {
          metadata?: { user_id?: string };
        };
        const userId = obj.metadata?.user_id;
        if (userId) {
          await supabase
            .from("users")
            .update({ tier: "free", updated_at: new Date().toISOString() })
            .eq("id", userId);
        }
        break;
      }
      default:
        // Unhandled event types are intentional — Stripe sends many we ignore.
        break;
    }
  } catch (error) {
    console.error("[stripe-webhook]", event.type, error);
    return NextResponse.json({ error: "handler_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

/**
 * Verify a Stripe webhook signature without the SDK.
 * Reference: https://docs.stripe.com/webhooks#verify-manually
 */
function verifySignature(payload: string, header: string, secret: string): boolean {
  const parts = header.split(",").reduce<Record<string, string>>((acc, pair) => {
    const [k, v] = pair.split("=", 2);
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {});

  const timestamp = parts.t;
  const v1 = parts.v1;
  if (!timestamp || !v1) return false;

  // Reject events older than 5 minutes (replay protection)
  const eventAge = Date.now() / 1000 - Number.parseInt(timestamp, 10);
  if (Number.isNaN(eventAge) || eventAge > 300) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac("sha256", secret).update(signedPayload).digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  const receivedBuf = Buffer.from(v1, "hex");
  if (expectedBuf.length !== receivedBuf.length) return false;
  return timingSafeEqual(expectedBuf, receivedBuf);
}
