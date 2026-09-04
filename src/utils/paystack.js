import { createHmac } from "crypto";

const PAYSTACK_BASE = "https://api.paystack.co";

function authHeaders() {
    return {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
    };
}

export async function initializeTransaction({ email, amount, reference, callbackUrl }) {
    const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
            email,
            amount: Math.round(amount * 100), // paystack expects kobo (smallest unit)
            reference,
            callback_url: callbackUrl,
        }),
    });
    const data = await res.json();
    if (!res.ok || !data.status) {
        throw new Error(data.message || "failed to initialize paystack transaction");
    }
    return { authorizationUrl: data.data.authorization_url };
}

export async function verifyTransaction(reference) {
    const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.status) {
        throw new Error(data.message || "failed to verify paystack transaction");
    }
    return data.data; // includes .status ("success" | "failed" | ...), .reference, .amount
}

export function verifyWebhookSignature(rawBody, signature) {
    const hash = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(rawBody).digest("hex");
    return hash === signature;
}
