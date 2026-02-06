import crypto from "node:crypto";

// Use a consistent encryption key from environment, or generate one and warn
// WARNING: If ENCRYPTION_KEY is not set, a new random key will be generated on each restart,
// which means previously encrypted data cannot be decrypted.
const ENCRYPTION_KEY: string =
  process.env.ENCRYPTION_KEY ||
  (() => {
    console.warn(
      "[ENCRYPTION] WARNING: ENCRYPTION_KEY not set in environment. Using a random key that will change on restart."
    );
    console.warn(
      "[ENCRYPTION] This means encrypted data cannot be decrypted after server restart."
    );
    console.warn(
      "[ENCRYPTION] Set ENCRYPTION_KEY in your .env.local file for production use."
    );
    return crypto.randomBytes(32).toString("hex");
  })();

const ALGORITHM = "aes-256-gcm";

/**
 * Encrypt sensitive text (e.g., API tokens) using AES-256-GCM
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt encrypted text
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText || typeof encryptedText !== "string") {
    throw new Error("Invalid encrypted text: must be a non-empty string");
  }

  const [ivHex, authTagHex, encrypted] = encryptedText.split(":");

  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error(
      `Invalid encrypted text format. Expected format: iv:authTag:encrypted, got: ${encryptedText.substring(0, 50)}...`
    );
  }

  try {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, "hex"),
      Buffer.from(ivHex, "hex")
    );

    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("Unsupported state") ||
        error.message.includes("unable to authenticate"))
    ) {
      throw new Error(
        "Decryption failed: Encryption key may have changed or data is corrupted. Please re-enter your credentials."
      );
    }
    throw error;
  }
}
