import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("email, display_name, tier")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-[760px] mx-auto flex flex-col gap-6">
      <header>
        <h1
          className="font-bold m-0"
          style={{ fontSize: 32, letterSpacing: "-0.02em", lineHeight: 1.15 }}
        >
          Settings
        </h1>
        <p className="text-[14px] text-kno-text-gray mt-1.5">
          Manage your account profile, security, and danger zone.
        </p>
      </header>

      <SettingsForm
        initialEmail={profile?.email ?? user.email ?? ""}
        initialDisplayName={profile?.display_name ?? ""}
      />
    </div>
  );
}
