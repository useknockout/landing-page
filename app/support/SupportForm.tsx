"use client";

import { useState } from "react";
import { Button } from "@/components/Button";

const SUPPORT_EMAIL = "hi@useknockout.com";
const GITHUB_ISSUES = "https://github.com/useknockout/landing-page/issues";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

export function SupportForm() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !subject.trim() || !message.trim()) return;
    setStatus({ kind: "sending" });
    try {
      const resp = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subject, message, company }),
      });
      if (resp.ok) {
        setStatus({ kind: "sent" });
        return;
      }
      const body = await resp.json().catch(() => ({}));
      setStatus({ kind: "error", message: errorMessage(resp.status, body.error) });
    } catch {
      setStatus({ kind: "error", message: "Network error. Email us directly instead." });
    }
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — the address is shown in plain text anyway */
    }
  }

  if (status.kind === "sent") {
    return (
      <div className="rounded-kno-xl border border-kno-border-gray bg-kno-white p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-kno-success-mint flex items-center justify-center mx-auto mb-4">
          <span className="text-kno-success-fg text-xl">✓</span>
        </div>
        <h2 className="font-semibold text-[18px] mb-2">Message sent</h2>
        <p className="text-[14px] text-kno-text-gray max-w-[420px] mx-auto">
          Thanks — we got it and will reply to <strong>{email}</strong>. Most messages get a
          response within one business day.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus({ kind: "idle" });
            setSubject("");
            setMessage("");
          }}
          className="mt-5 text-[13px] text-kno-text-gray hover:text-kno-black underline decoration-kno-border-strong underline-offset-4"
        >
          Send another message
        </button>
      </div>
    );
  }

  const sending = status.kind === "sending";

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-kno-xl border border-kno-border-gray bg-kno-white p-6 flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] text-kno-text-gray font-medium" htmlFor="support-email">
            Your email
          </label>
          <input
            id="support-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="font-sans text-[14px] px-3 py-2.5 rounded-kno-md border border-kno-border-gray bg-kno-white outline-none focus:border-kno-green focus:shadow-kno-focus"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] text-kno-text-gray font-medium" htmlFor="support-subject">
            Subject
          </label>
          <input
            id="support-subject"
            type="text"
            required
            maxLength={200}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. /replace-bg returning 422 on PNGs"
            className="font-sans text-[14px] px-3 py-2.5 rounded-kno-md border border-kno-border-gray bg-kno-white outline-none focus:border-kno-green focus:shadow-kno-focus"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] text-kno-text-gray font-medium" htmlFor="support-message">
            Message
          </label>
          <textarea
            id="support-message"
            required
            rows={6}
            maxLength={5000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What's happening? Include the request_id from any error response so we can trace it fast."
            className="font-sans text-[14px] px-3 py-2.5 rounded-kno-md border border-kno-border-gray bg-kno-white outline-none focus:border-kno-green focus:shadow-kno-focus resize-y min-h-[120px]"
          />
        </div>

        {/* Honeypot — hidden from humans, catches bots. */}
        <div aria-hidden className="absolute -left-[9999px] w-px h-px overflow-hidden">
          <label htmlFor="support-company">Company</label>
          <input
            id="support-company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <Button
          variant="primary"
          size="lg"
          type="submit"
          className="w-full"
          disabled={sending || !email || !subject.trim() || !message.trim()}
        >
          {sending ? "Sending…" : "Send message"}
        </Button>

        {status.kind === "error" && (
          <div className="px-3 py-2 rounded-kno-md border border-[#FCA5A5] bg-kno-error-bg text-[13px] text-[#B91C1C]">
            {status.message}
          </div>
        )}
      </form>

      {/* Always-on fallbacks so support is reachable even if the form fails. */}
      <div className="rounded-kno-xl border border-kno-border-gray bg-kno-surface-gray p-6 flex flex-col gap-4">
        <h2 className="font-semibold text-[15px] m-0">Other ways to reach us</h2>

        <div className="flex flex-wrap items-center gap-2 text-[14px]">
          <span className="text-kno-text-gray">Email</span>
          <code className="font-mono text-[13px] px-2 py-1 rounded-kno-sm bg-kno-white border border-kno-border-gray">
            {SUPPORT_EMAIL}
          </code>
          <button
            type="button"
            onClick={copyEmail}
            className="text-[13px] font-medium text-kno-black px-2.5 py-1 rounded-kno-sm border border-kno-border-gray bg-kno-white hover:bg-kno-surface-gray transition-colors duration-kno-fast ease-kno-out"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-[13px] font-medium text-kno-green hover:underline underline-offset-4"
          >
            Open email client →
          </a>
        </div>

        <div className="text-[14px]">
          <span className="text-kno-text-gray">Bug or feature request? </span>
          <a
            href={GITHUB_ISSUES}
            target="_blank"
            rel="noopener noreferrer"
            className="text-kno-green hover:underline underline-offset-4 font-medium"
          >
            Open a GitHub issue →
          </a>
        </div>
      </div>
    </div>
  );
}

function errorMessage(status: number, code?: string): string {
  if (status === 503 && code === "support_not_configured") {
    return "Our contact form is being set up. Please email us directly for now.";
  }
  if (status === 429) return "Too many messages. Wait a few minutes, or email us directly.";
  if (status === 400 && code === "invalid_email") return "That email address looks off. Check it and retry.";
  if (status === 502 || code === "send_failed") {
    return "We couldn't send that. Please email us directly instead.";
  }
  return "Something went wrong. Please email us directly instead.";
}
