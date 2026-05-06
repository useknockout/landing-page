import { createHash, randomBytes } from "crypto";

/**
 * Generate a fresh API token.
 *
 * Format: `kno_<env>_<32 random url-safe chars>`.
 * Example: `kno_live_a3f8b2c4d6e7891f2a4b6c8d9e1f3a5b`.
 *
 * The full token is shown to the user EXACTLY ONCE on creation. We store only
 * a SHA-256 hash + a 12-char prefix (the prefix is what appears in the UI).
 */
export type TokenEnv = "test" | "live";

export type GeneratedToken = {
  raw: string;       // shown once to user, never persisted
  prefix: string;    // displayed in dashboard listings
  hashed: string;    // stored in DB, used to verify incoming Authorization headers
  env: TokenEnv;
};

const ENV_LABEL: Record<TokenEnv, string> = {
  test: "test",
  live: "live",
};

export function generateToken(env: TokenEnv = "live"): GeneratedToken {
  // 24 bytes → 32 url-safe chars after base64url encoding (excluding padding).
  const random = randomBytes(24)
    .toString("base64")
    .replace(/\+/g, "")
    .replace(/\//g, "")
    .replace(/=/g, "")
    .slice(0, 32);
  const raw = `kno_${ENV_LABEL[env]}_${random}`;
  return {
    raw,
    prefix: raw.slice(0, 12), // e.g. "kno_live_a3f"
    hashed: hashToken(raw),
    env,
  };
}

/** SHA-256 hash of the raw token. Same function used at API verify time. */
export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Display-friendly masked token: kno_live_abc1•••••••••••••••••••••••• */
export function maskToken(prefix: string): string {
  return `${prefix}${"•".repeat(28)}`;
}
