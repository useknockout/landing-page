/**
 * Tiny Stripe REST wrapper.
 * We deliberately avoid the npm `stripe` package to keep bundle size + cold starts low.
 * Only the few endpoints we need are wrapped here.
 */
const STRIPE_API = "https://api.stripe.com/v1";

function authHeader(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return `Bearer ${key}`;
}

function formEncode(obj: Record<string, string | number | boolean | undefined>): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    params.append(k, String(v));
  }
  return params.toString();
}

export async function stripeRequest<T = unknown>(
  path: string,
  init?: { method?: string; body?: Record<string, string | number | boolean | undefined> },
): Promise<T> {
  const method = init?.method ?? "POST";
  const resp = await fetch(`${STRIPE_API}${path}`, {
    method,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: init?.body ? formEncode(init.body) : undefined,
  });
  const json = await resp.json();
  if (!resp.ok) {
    const msg =
      typeof json === "object" && json && "error" in json
        ? (json as { error: { message: string } }).error?.message
        : `Stripe ${resp.status}`;
    throw new Error(msg ?? `Stripe ${resp.status}`);
  }
  return json as T;
}

export async function createCheckoutSession(opts: {
  priceId: string;
  customerEmail?: string;
  customerId?: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ id: string; url: string }> {
  // NOTE: do NOT pass `line_items[0][quantity]` here. Our prices are metered
  // (`usage_type: metered`), so Stripe rejects an explicit quantity — the
  // billed amount is derived from meter events at period end.
  const body: Record<string, string | number | boolean | undefined> = {
    mode: "subscription",
    "line_items[0][price]": opts.priceId,
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    "metadata[user_id]": opts.userId,
    "subscription_data[metadata][user_id]": opts.userId,
  };
  if (opts.customerId) {
    body.customer = opts.customerId;
  } else if (opts.customerEmail) {
    body.customer_email = opts.customerEmail;
  }
  return stripeRequest<{ id: string; url: string }>("/checkout/sessions", { body });
}

export async function createBillingPortalSession(opts: {
  customerId: string;
  returnUrl: string;
}): Promise<{ id: string; url: string }> {
  return stripeRequest<{ id: string; url: string }>("/billing_portal/sessions", {
    body: { customer: opts.customerId, return_url: opts.returnUrl },
  });
}
