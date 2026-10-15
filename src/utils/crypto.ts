/**
 * Secure client-side hashing helper using Web Crypto API (SHA-256)
 * with salt for password storage simulation.
 */
export async function hashPassword(password: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    // Fallback simple bit-shift hash string if crypto is not supported in some environments
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `hash_fallback_${Math.abs(hash).toString(16)}`;
  }

  const salt = "apex_trade_salt_v1:";
  const msgUint8 = new TextEncoder().encode(salt + password);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `sha256_${hashHex}`;
}
