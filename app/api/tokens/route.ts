import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateToken } from "@/lib/tokens";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("tokens")
    .select("id, name, prefix, env, scopes, last_used_at, revoked_at, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tokens: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const name: string = (body.name ?? "Untitled").toString().slice(0, 80);
  const env: "test" | "live" = body.env === "test" ? "test" : "live";
  const scopes: string[] = Array.isArray(body.scopes) ? body.scopes.slice(0, 25) : [];

  const generated = generateToken(env);

  const { data, error } = await supabase
    .from("tokens")
    .insert({
      user_id: user.id,
      name,
      prefix: generated.prefix,
      hashed_token: generated.hashed,
      env: generated.env,
      scopes,
    })
    .select("id, name, prefix, env, scopes, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Raw token returned ONCE to the client. Never persisted.
  return NextResponse.json({ token: { ...data, raw: generated.raw } }, { status: 201 });
}
