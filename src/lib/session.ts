/**
 * Stateless signed-cookie session.
 *
 * The cookie value is `<expiresAtMs>.<hmacSha256(expiresAtMs)>`, signed with
 * SESSION_SECRET. Everything is done with Web Crypto so the same helpers work
 * in middleware (edge runtime) and in server actions (node runtime).
 */

export const SESSION_COOKIE = "cc_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

const encoder = new TextEncoder();

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value) {
    throw new Error("SESSION_SECRET is not set");
  }
  return value;
}

async function key(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionValue(): Promise<string> {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const signature = await crypto.subtle.sign(
    "HMAC",
    await key(),
    encoder.encode(String(expiresAt)),
  );
  return `${expiresAt}.${toHex(signature)}`;
}

export async function verifySessionValue(
  value: string | undefined,
): Promise<boolean> {
  if (!value) return false;

  const separator = value.lastIndexOf(".");
  if (separator === -1) return false;

  const expiresAtRaw = value.slice(0, separator);
  const signatureHex = value.slice(separator + 1);

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  if (signatureHex.length % 2 !== 0) return false;
  const signature = new Uint8Array(
    signatureHex.match(/.{2}/g)?.map((byte) => parseInt(byte, 16)) ?? [],
  );
  if (signature.length !== 32) return false;

  return crypto.subtle.verify(
    "HMAC",
    await key(),
    signature,
    encoder.encode(expiresAtRaw),
  );
}

/** Constant-time string comparison, so login timing does not leak the password. */
export function safeEqual(a: string, b: string): boolean {
  const bytesA = encoder.encode(a);
  const bytesB = encoder.encode(b);
  // Compare lengths without an early return, then fold the result in.
  let mismatch = bytesA.length ^ bytesB.length;
  const max = Math.max(bytesA.length, bytesB.length);
  for (let i = 0; i < max; i++) {
    mismatch |= (bytesA[i] ?? 0) ^ (bytesB[i] ?? 0);
  }
  return mismatch === 0;
}
