"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { createClient } from "@/lib/supabase/client";

type Props = {
  initialEmail: string;
  initialDisplayName: string;
};

export function SettingsForm({ initialEmail, initialDisplayName }: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { error: e1 } = await supabase
        .from("users")
        .update({ display_name: displayName, updated_at: new Date().toISOString() })
        .eq("id", u.user.id);
      if (e1) throw e1;
      setSavedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function sendPasswordReset() {
    setError(null);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error: e1 } = await supabase.auth.resetPasswordForEmail(initialEmail, {
        redirectTo: `${origin}/auth/callback?redirect=/dashboard/settings`,
      });
      if (e1) throw e1;
      alert("Password reset email sent. Check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset request failed");
    }
  }

  async function deleteAccount() {
    if (
      !confirm(
        "Permanently delete your useknockout account? Tokens will be revoked, usage history removed, and Stripe subscriptions cancelled. This cannot be undone.",
      )
    ) {
      return;
    }
    if (!confirm("Are you absolutely sure? Type DELETE in the next prompt.")) return;
    const confirmText = prompt("Type DELETE to confirm:");
    if (confirmText !== "DELETE") {
      alert("Cancelled.");
      return;
    }
    try {
      const resp = await fetch("/api/account/delete", { method: "POST" });
      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j.error ?? "Delete failed");
      }
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-kno-white border border-kno-border-gray rounded-kno-lg p-6">
        <h2 className="font-semibold text-[16px] m-0 mb-4">Profile</h2>
        <form onSubmit={saveProfile} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-kno-text-gray font-medium">Email</label>
            <input
              type="email"
              value={initialEmail}
              readOnly
              disabled
              className="font-mono text-[13px] px-3 py-2 rounded-kno-md border border-kno-border-gray bg-kno-surface-gray text-kno-text-gray cursor-not-allowed"
            />
            <p className="text-[12px] text-kno-text-gray">
              Email is tied to your sign-in. Contact support to change it.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-kno-text-gray font-medium">
              Display name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={80}
              placeholder="Your name"
              className="font-sans text-[13px] px-3 py-2 rounded-kno-md border border-kno-border-gray bg-kno-white outline-none focus:border-kno-green focus:shadow-kno-focus"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="primary" size="md" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save profile"}
            </Button>
            {savedAt && (
              <span className="font-mono text-[11px] text-kno-success-fg">
                Saved {savedAt.toLocaleTimeString()}
              </span>
            )}
          </div>
        </form>
      </section>

      <section className="bg-kno-white border border-kno-border-gray rounded-kno-lg p-6">
        <h2 className="font-semibold text-[16px] m-0 mb-2">Security</h2>
        <p className="text-[13px] text-kno-text-gray mb-4">
          We send a one-time link to your email to set or change your password.
        </p>
        <Button variant="secondary" size="md" onClick={sendPasswordReset}>
          Send password reset email
        </Button>
      </section>

      <section className="bg-kno-white border border-[#FCA5A5] rounded-kno-lg p-6">
        <h2 className="font-semibold text-[16px] m-0 mb-2 text-kno-error-red">
          Danger zone
        </h2>
        <p className="text-[13px] text-kno-text-gray mb-4">
          Permanently delete your account, all tokens, and usage data.
        </p>
        <button
          type="button"
          onClick={deleteAccount}
          className="bg-kno-error-bg text-kno-error-red border border-[#FCA5A5] px-4 py-2 rounded-kno-md font-semibold text-[13px] cursor-pointer hover:bg-[#FECACA] transition-colors duration-kno-fast ease-kno-out"
        >
          Delete my account
        </button>
      </section>

      {error && (
        <div className="px-4 py-3 rounded-kno-md border border-[#FCA5A5] bg-kno-error-bg text-[13px] text-[#B91C1C]">
          {error}
        </div>
      )}
    </div>
  );
}
