import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/stripe";

const PRICE_BY_TIER: Record<string, string | undefined> = {
  payg: process.env.STRIPE_PRICE_PAYG,
  volume: process.env.STRIPE_PRICE_VOLUME,
};

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const tier: string = body.tier ?? "payg";
  const priceId = PRICE_BY_TIER[tier];
  if (!priceId) {
    return NextResponse.json({ error: "invalid_tier" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("email, stripe_customer_id")
    .eq("id", user.id)
    .single();

  const origin = request.headers.get("origin") ?? "https://useknockout.com";

  try {
    const session = await createCheckoutSession({
      priceId,
      userId: user.id,
      customerEmail: profile?.email ?? user.email ?? undefined,
      customerId: profile?.stripe_customer_id ?? undefined,
      successUrl: `${origin}/dashboard/billing?upgraded=1`,
      cancelUrl: `${origin}/pricing?canceled=1`,
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Stripe error" },
      { status: 500 },
    );
  }
}
