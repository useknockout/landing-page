import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { KeysClient, type DbToken } from "./KeysClient";

export const metadata: Metadata = { title: "API keys" };
export const dynamic = "force-dynamic";

export default async function KeysPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("tokens")
    .select("id, name, prefix, env, scopes, last_used_at, revoked_at, created_at")
    .order("created_at", { ascending: false });

  const tokens = (data ?? []) as DbToken[];
  return <KeysClient initialTokens={tokens} />;
}
