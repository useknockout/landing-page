import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createBillingPortalSession } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.redirect(new URL("/pricing", request.url));
  }

  const origin = request.headers.get("origin") ?? "https://useknockout.com";
  try {
    const session = await createBillingPortalSession({
      customerId: profile.stripe_customer_id,
      returnUrl: `${origin}/dashboard/billing`,
    });
    return NextResponse.redirect(session.url);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Stripe error" },
      { status: 500 },
    );
  }
}
