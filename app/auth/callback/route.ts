import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase OAuth + magic-link callback.
 * Exchanges the `code` query param for a session, then redirects to the
 * stored `redirect` query param (defaults to `/dashboard`).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("redirect") ?? "/dashboard";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth failed — bounce to signin with an error flag.
  const signinUrl = new URL("/signin", origin);
  signinUrl.searchParams.set("error", "auth_callback_failed");
  return NextResponse.redirect(signinUrl);
}
