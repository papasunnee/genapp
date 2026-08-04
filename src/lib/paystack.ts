import crypto from "crypto";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured");
  return key;
}

export interface InitializeTransactionParams {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, any>;
}

export interface InitializeTransactionResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

/**
 * Starts a Paystack transaction and returns the hosted checkout URL to
 * redirect the customer's browser to. Amount must already be in kobo
 * (Paystack's base unit) - callers convert from Naira before calling this.
 */
export async function initializeTransaction(
  params: InitializeTransactionParams
): Promise<InitializeTransactionResult> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message || "Failed to initialize Paystack transaction");
  }

  return {
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code,
    reference: json.data.reference,
  };
}

export interface PaystackTransactionData {
  status: "success" | "failed" | "abandoned" | string;
  reference: string;
  amount: number;
  currency: string;
  customer: { email: string };
  metadata: Record<string, any> | null;
}

/**
 * Server-to-server verification of a transaction reference - the
 * authoritative check that a payment actually succeeded. Never provision
 * an organization off the client-reported status or the webhook payload
 * alone; always confirm against this endpoint first.
 */
export async function verifyTransaction(
  reference: string
): Promise<PaystackTransactionData> {
  const res = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${getSecretKey()}` },
    }
  );

  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message || "Failed to verify Paystack transaction");
  }

  return json.data;
}

/**
 * Paystack signs every webhook payload with an HMAC-SHA512 of the raw
 * request body, keyed by the secret key, sent as x-paystack-signature.
 * Must be checked against the raw body string (not the parsed/re-serialized
 * JSON) since re-serialization can change whitespace and break the hash.
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const expected = crypto
    .createHmac("sha512", getSecretKey())
    .update(rawBody)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected) as any, Buffer.from(signature) as any);
  } catch {
    return false;
  }
}
