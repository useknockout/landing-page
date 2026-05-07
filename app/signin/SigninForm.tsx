"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { createClient } from "@/lib/supabase/client";

export function SigninForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/dashboard";
  const errorParam = params.get("error");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === "auth_callback_failed"
      ? "Sign-in link expired or was already used. Try again."
      : null,
  );

  async function handleGoogle() {
    setError(null);
    setSubmitting(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
      setSubmitting(false);
    }
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setError(null);
    setSubmitting(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // Both the link and the 6-digit code are sent in the same email; this
          // URL is the fallback if the user clicks the link instead of typing
          // the code (e.g. on a different device).
          emailRedirectTo: `${origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      });
      if (otpError) throw otpError;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    const cleanCode = code.replace(/\s+/g, "");
    if (cleanCode.length !== 6) {
      setError("Enter the 6-digit code from your email");
      return;
    }
    setError(null);
    setVerifying(true);
    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: cleanCode,
        type: "email",
      });
      if (verifyError) throw verifyError;
      router.push(redirect);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not verify code";
      // Friendlier message for the most common error.
      setError(
        /token has expired|otp_expired|invalid/i.test(msg)
          ? "That code is invalid or expired. Request a new one."
          : msg,
      );
      setVerifying(false);
    }
  }

  async function handleResend() {
    setError(null);
    setCode("");
    setSubmitting(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      });
      if (otpError) throw otpError;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend code");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-5">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-kno-success-mint flex items-center justify-center mx-auto mb-4">
            <span className="text-kno-success-fg text-xl">✓</span>
          </div>
          <h2 className="font-semibold text-[18px] mb-2">Check your email</h2>
          <p className="text-[14px] text-kno-text-gray">
            We sent a 6-digit code to <strong>{email}</strong>.
          </p>
        </div>

        <form onSubmit={handleVerifyCode} className="flex flex-col gap-3">
          <label className="text-[12px] text-kno-text-gray font-medium" htmlFor="code">
            Sign-in code
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="123456"
            className="font-mono text-center text-[20px] tracking-[0.4em] px-3 py-3 rounded-kno-md border border-kno-border-gray bg-kno-white outline-none focus:border-kno-green focus:shadow-kno-focus"
          />
          <Button
            variant="primary"
            size="lg"
            type="submit"
            className="w-full"
            disabled={verifying || code.length !== 6}
          >
            {verifying ? "Verifying…" : "Verify and continue"}
          </Button>
        </form>

        {error && (
          <div className="px-3 py-2 rounded-kno-md border border-[#FCA5A5] bg-kno-error-bg text-[13px] text-[#B91C1C]">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between text-[12px] text-kno-text-gray">
          <button
            type="button"
            onClick={handleResend}
            disabled={submitting}
            className="hover:text-kno-black underline decoration-kno-border-strong underline-offset-4 disabled:opacity-50"
          >
            {submitting ? "Resending…" : "Resend code"}
          </button>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setEmail("");
              setCode("");
              setError(null);
            }}
            className="hover:text-kno-black underline decoration-kno-border-strong underline-offset-4"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Button
        variant="secondary"
        size="lg"
        className="w-full"
        onClick={handleGoogle}
        disabled={submitting}
      >
        <GoogleMark />
        Continue with Google
      </Button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-kno-border-gray" />
        <span className="text-[12px] text-kno-text-gray font-mono uppercase tracking-[0.06em]">
          or
        </span>
        <div className="flex-1 h-px bg-kno-border-gray" />
      </div>

      <form onSubmit={handleSendCode} className="flex flex-col gap-3">
        <label className="text-[12px] text-kno-text-gray font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="font-sans text-[14px] px-3 py-2.5 rounded-kno-md border border-kno-border-gray bg-kno-white outline-none focus:border-kno-green focus:shadow-kno-focus"
        />
        <Button
          variant="primary"
          size="lg"
          type="submit"
          className="w-full"
          disabled={submitting || !email}
        >
          {submitting ? "Sending…" : "Email me a sign-in code"}
        </Button>
      </form>

      {error && (
        <div className="px-3 py-2 rounded-kno-md border border-[#FCA5A5] bg-kno-error-bg text-[13px] text-[#B91C1C]">
          {error}
        </div>
      )}

      <p className="text-[12px] text-kno-text-gray text-center">
        By continuing you agree to our{" "}
        <a href="/terms" className="underline decoration-kno-border-strong underline-offset-2">
          Terms
        </a>{" "}
        and{" "}
        <a href="/privacy" className="underline decoration-kno-border-strong underline-offset-2">
          Privacy
        </a>
        .
      </p>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.7h5.2c-.2 1.4-1.7 4.1-5.2 4.1-3.1 0-5.7-2.6-5.7-5.8s2.6-5.8 5.7-5.8c1.8 0 3 .8 3.7 1.4l2.5-2.5C16.6 3.8 14.5 3 12 3 6.9 3 2.7 7.2 2.7 12.3S6.9 21.5 12 21.5c6.9 0 9.5-4.8 9.5-7.3 0-.5 0-.9-.1-1.3l-9.4-.7z"
      />
      <path
        fill="#4285F4"
        d="M21.4 12.2c0-.7-.1-1.3-.2-1.9H12v3.7h5.3c-.2 1.2-.9 2.2-2 2.9l3.2 2.5c1.9-1.7 3-4.3 3-7.2z"
      />
      <path
        fill="#FBBC05"
        d="M5.4 14.5c-.2-.6-.4-1.4-.4-2.2 0-.8.1-1.5.4-2.2L2.1 7.5C1.4 9 1 10.6 1 12.3s.4 3.3 1.1 4.8l3.3-2.6z"
      />
      <path
        fill="#34A853"
        d="M12 21.5c2.7 0 5-1 6.6-2.6l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1L2.1 16.6C3.8 19.7 7.6 21.5 12 21.5z"
      />
    </svg>
  );
}
