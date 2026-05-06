import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/**
 * Permanently delete the current user's account.
 * Steps:
 *   1. Verify session
 *   2. Cancel any Stripe subscription (if linked)
 *   3. Delete the auth.users row (cascades to public.users + tokens + usage via FK)
 */
export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const service = createServiceClient();

  // Look up Stripe customer for cancellation (best-effort, don't block on failure).
  const { data: profile } = await service
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (profile?.stripe_customer_id && process.env.STRIPE_SECRET_KEY) {
    try {
      // Cancel all active subscriptions for this customer.
      const cancelResp = await fetch(
        `https://api.stripe.com/v1/subscriptions?customer=${encodeURIComponent(profile.stripe_customer_id)}&status=active`,
        {
          headers: {
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          },
        },
      );
      if (cancelResp.ok) {
        const j = await cancelResp.json();
        for (const sub of j.data ?? []) {
          await fetch(`https://api.stripe.com/v1/subscriptions/${sub.id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            },
          });
        }
      }
    } catch {
      // Non-fatal — admin will reconcile.
    }
  }

  // Delete the auth user. ON DELETE CASCADE on public.users.id removes profile +
  // tokens + usage rows automatically.
  const { error } = await service.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
