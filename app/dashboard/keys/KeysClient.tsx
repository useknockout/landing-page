"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { copyToClipboard } from "@/lib/copy";

export type DbToken = {
  id: string;
  name: string;
  prefix: string;
  env: "test" | "live";
  scopes: string[];
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

type CreatedToken = DbToken & { raw: string };

export function KeysClient({ initialTokens }: { initialTokens: DbToken[] }) {
  const [tokens, setTokens] = useState<DbToken[]>(initialTokens);
  const [env, setEnv] = useState<"test" | "live">("live");
  const [creating, setCreating] = useState(false);
  const [revealed, setRevealed] = useState<CreatedToken | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visible = tokens.filter((t) => t.env === env);
  const restricted = visible.filter((t) => t.scopes.length > 0 && !t.revoked_at);
  const fullAccess = visible.filter((t) => t.scopes.length === 0 && !t.revoked_at);
  const revoked = visible.filter((t) => t.revoked_at);

  async function createToken(opts: {
    name: string;
    scopes?: string[];
  }): Promise<CreatedToken | null> {
    setError(null);
    setCreating(true);
    try {
      const resp = await fetch("/api/tokens", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: opts.name, env, scopes: opts.scopes ?? [] }),
      });
      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j.error ?? "Token creation failed");
      }
      const j = await resp.json();
      const created: CreatedToken = j.token;
      setTokens((prev) => [created, ...prev]);
      setRevealed(created);
      return created;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Token creation failed");
      return null;
    } finally {
      setCreating(false);
    }
  }

  async function revoke(id: string) {
    if (!confirm("Revoke this token? Existing requests using it will start failing immediately.")) {
      return;
    }
    const resp = await fetch(`/api/tokens/${id}`, { method: "DELETE" });
    if (resp.ok) {
      setTokens((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, revoked_at: new Date().toISOString() } : t,
        ),
      );
    }
  }

  return (
    <div className="max-w-[1024px] mx-auto flex flex-col gap-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1
            className="font-bold m-0"
            style={{ fontSize: 32, letterSpacing: "-0.02em", lineHeight: 1.15 }}
          >
            API keys
          </h1>
          <p className="text-[14px] text-kno-text-gray mt-1.5">
            Issue and manage tokens for {env === "live" ? "production" : "test"}{" "}
            traffic. Tokens are shown in full only once.
          </p>
        </div>
        <EnvToggle value={env} onChange={setEnv} />
      </header>

      <Banner />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FullAccessCard
          tokens={fullAccess}
          env={env}
          onCreate={(name) => createToken({ name })}
          onRevoke={revoke}
          creating={creating}
        />
        <RestrictedCard
          tokens={restricted}
          env={env}
          onCreate={(name, scopes) => createToken({ name, scopes })}
          onRevoke={revoke}
          creating={creating}
        />
      </div>

      {revoked.length > 0 && <RevokedSection tokens={revoked} />}

      {error && (
        <div className="px-4 py-3 rounded-kno-md border border-[#FCA5A5] bg-kno-error-bg text-[13px] text-[#B91C1C]">
          {error}
        </div>
      )}

      {revealed && (
        <RevealModal token={revealed} onClose={() => setRevealed(null)} />
      )}
    </div>
  );
}

function EnvToggle({
  value,
  onChange,
}: {
  value: "test" | "live";
  onChange: (v: "test" | "live") => void;
}) {
  return (
    <div className="inline-flex items-center bg-kno-white border border-kno-border-gray rounded-kno-md p-0.5">
      {(["test", "live"] as const).map((e) => (
        <button
          key={e}
          type="button"
          onClick={() => onChange(e)}
          className={`px-3 py-1.5 rounded-[5px] font-mono text-[12px] uppercase tracking-[0.04em] transition-colors duration-kno-fast ease-kno-out ${
            value === e
              ? "bg-kno-black text-kno-white"
              : "text-kno-text-gray hover:text-kno-black"
          }`}
        >
          <span
            className={`inline-block w-[6px] h-[6px] rounded-full mr-2 ${
              e === "live" ? "bg-kno-green" : "bg-kno-warn-amber"
            }`}
          />
          {e}
        </button>
      ))}
    </div>
  );
}

function Banner() {
  return (
    <div className="px-4 py-3 rounded-kno-md border border-kno-warn-border bg-kno-warn-bg text-[13px] text-kno-warn-fg">
      Your full-access tokens grant complete account permissions. For production
      workloads use restricted tokens that only allow the endpoints you need.
    </div>
  );
}

function FullAccessCard({
  tokens,
  env,
  onCreate,
  onRevoke,
  creating,
}: {
  tokens: DbToken[];
  env: "test" | "live";
  onCreate: (name: string) => Promise<CreatedToken | null>;
  onRevoke: (id: string) => void;
  creating: boolean;
}) {
  const [name, setName] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    const ok = await onCreate(name.trim());
    if (ok) {
      setName("");
      setShowForm(false);
    }
  }

  return (
    <div className="bg-kno-white border border-kno-border-gray rounded-kno-lg p-5 flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold text-[16px] m-0">Full access keys</h2>
        <span className="font-mono text-[11px] text-kno-text-gray">
          {tokens.length} active
        </span>
      </div>

      {tokens.length === 0 && !showForm && (
        <p className="text-[13px] text-kno-text-gray m-0">
          No full-access tokens yet.
        </p>
      )}

      {tokens.map((t) => (
        <TokenRow key={t.id} token={t} onRevoke={onRevoke} />
      ))}

      {showForm ? (
        <div className="flex flex-col gap-2 pt-2 border-t border-kno-border-gray">
          <label className="text-[12px] text-kno-text-gray font-medium">
            Token name
          </label>
          <input
            type="text"
            placeholder="Production"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="font-sans text-[13px] px-3 py-2 rounded-kno-md border border-kno-border-gray bg-kno-white outline-none focus:border-kno-green focus:shadow-kno-focus"
          />
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreate}
              disabled={creating || !name.trim()}
            >
              {creating ? "Creating…" : `Create ${env} token`}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowForm(true)}
          className="self-start"
        >
          + Create {env} token
        </Button>
      )}
    </div>
  );
}

function RestrictedCard({
  tokens,
  env,
  onCreate,
  onRevoke,
  creating,
}: {
  tokens: DbToken[];
  env: "test" | "live";
  onCreate: (name: string, scopes: string[]) => Promise<CreatedToken | null>;
  onRevoke: (id: string) => void;
  creating: boolean;
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);

  const SCOPES = [
    "/remove",
    "/remove-url",
    "/replace-bg",
    "/sticker",
    "/studio-shot",
    "/mask",
    "/upscale",
    "/face-restore",
  ];

  function toggleScope(scope: string) {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  }

  async function handleCreate() {
    if (!name.trim() || selectedScopes.length === 0) return;
    const ok = await onCreate(name.trim(), selectedScopes);
    if (ok) {
      setName("");
      setSelectedScopes([]);
      setShowForm(false);
    }
  }

  return (
    <div className="bg-kno-white border border-kno-border-gray rounded-kno-lg p-5 flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold text-[16px] m-0">Restricted keys</h2>
        <span className="font-mono text-[11px] text-kno-text-gray">
          {tokens.length} active
        </span>
      </div>

      <p className="text-[13px] text-kno-text-gray m-0">
        Limit a token to specific endpoints. Recommended for production.
      </p>

      {tokens.map((t) => (
        <TokenRow key={t.id} token={t} onRevoke={onRevoke} />
      ))}

      {showForm ? (
        <div className="flex flex-col gap-3 pt-2 border-t border-kno-border-gray">
          <label className="text-[12px] text-kno-text-gray font-medium">
            Token name
          </label>
          <input
            type="text"
            placeholder="Web app"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="font-sans text-[13px] px-3 py-2 rounded-kno-md border border-kno-border-gray bg-kno-white outline-none focus:border-kno-green focus:shadow-kno-focus"
          />
          <label className="text-[12px] text-kno-text-gray font-medium">
            Allowed endpoints
          </label>
          <div className="flex flex-wrap gap-2">
            {SCOPES.map((scope) => {
              const active = selectedScopes.includes(scope);
              return (
                <button
                  key={scope}
                  type="button"
                  onClick={() => toggleScope(scope)}
                  className={`font-mono text-[12px] px-2.5 py-1 rounded-full border transition-colors duration-kno-fast ease-kno-out ${
                    active
                      ? "bg-kno-green text-kno-black border-kno-green"
                      : "bg-kno-white text-kno-text-gray border-kno-border-gray hover:text-kno-black"
                  }`}
                >
                  {scope}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreate}
              disabled={creating || !name.trim() || selectedScopes.length === 0}
            >
              {creating ? "Creating…" : `Create restricted token`}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setSelectedScopes([]);
                setName("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowForm(true)}
          className="self-start"
        >
          + Create restricted token
        </Button>
      )}
    </div>
  );
}

function TokenRow({
  token,
  onRevoke,
}: {
  token: DbToken;
  onRevoke: (id: string) => void;
}) {
  const lastUsed = token.last_used_at
    ? `Last used ${timeAgo(token.last_used_at)}`
    : "Never used";
  return (
    <div className="flex flex-col gap-2 px-3 py-3 border border-kno-border-gray rounded-kno-md">
      <div className="flex items-center gap-3 justify-between">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-medium text-[14px] truncate">{token.name}</span>
          <span className="font-mono text-[12px] text-kno-text-gray truncate">
            {token.prefix}
            {"•".repeat(20)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onRevoke(token.id)}
          className="text-[12px] text-kno-error-red font-medium hover:underline"
        >
          Revoke
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-kno-text-gray font-mono">
        <span>Created {timeAgo(token.created_at)}</span>
        <span>·</span>
        <span>{lastUsed}</span>
        {token.scopes.length > 0 && (
          <>
            <span>·</span>
            <span className="flex flex-wrap gap-1">
              {token.scopes.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="px-1.5 py-px rounded-kno-sm bg-kno-surface-gray border border-kno-border-gray text-kno-black text-[10px]"
                >
                  {s}
                </span>
              ))}
              {token.scopes.length > 3 && (
                <span className="text-[10px]">+{token.scopes.length - 3}</span>
              )}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function RevokedSection({ tokens }: { tokens: DbToken[] }) {
  return (
    <details className="bg-kno-white border border-kno-border-gray rounded-kno-lg p-5">
      <summary className="cursor-pointer font-semibold text-[14px] flex items-center justify-between">
        <span>Revoked tokens</span>
        <span className="font-mono text-[11px] text-kno-text-gray">
          {tokens.length}
        </span>
      </summary>
      <div className="mt-4 flex flex-col gap-2">
        {tokens.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 px-3 py-2 border border-kno-border-gray rounded-kno-md opacity-60"
          >
            <span className="font-medium text-[13px] line-through">{t.name}</span>
            <span className="font-mono text-[11px] text-kno-text-gray">
              {t.prefix}
            </span>
            <span className="ml-auto font-mono text-[11px] text-kno-text-gray">
              Revoked {t.revoked_at ? timeAgo(t.revoked_at) : ""}
            </span>
          </div>
        ))}
      </div>
    </details>
  );
}

function RevealModal({
  token,
  onClose,
}: {
  token: CreatedToken;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyToClipboard(token.raw);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-kno-white rounded-kno-xl border border-kno-border-gray w-full max-w-[560px] p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="font-bold m-0 mb-2"
          style={{ fontSize: 24, letterSpacing: "-0.015em" }}
        >
          New token created
        </h2>
        <p className="text-[14px] text-kno-text-gray mb-6">
          Copy this token now. It will <strong className="text-kno-black">only be shown once</strong>.
        </p>

        <div className="bg-kno-bg-dark text-kno-green font-mono text-[15px] px-4 py-4 rounded-kno-md break-all leading-snug border border-kno-border-dark">
          {token.raw}
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="primary" size="lg" onClick={handleCopy} className="flex-1 justify-center">
            {copied ? "Copied ✓" : "Copy token"}
          </Button>
          <Button variant="secondary" size="lg" onClick={onClose}>
            Done
          </Button>
        </div>

        <p className="font-mono text-[11px] text-kno-text-gray mt-6">
          name: {token.name} · env: {token.env} · scopes:{" "}
          {token.scopes.length > 0 ? token.scopes.join(", ") : "full access"}
        </p>
      </div>
    </div>
  );
}

function timeAgo(ts: string): string {
  const diffMs = Date.now() - new Date(ts).getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}
