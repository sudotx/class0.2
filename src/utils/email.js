// SendByte transactional email. No-ops unless BYTE_SECRET is set, so it's
// safe to call unconditionally (mirrors utils/telegram.js).

const FROM = process.env.EMAIL_FROM || "Store <onboarding@yourapp.ng>";
const money = (n) => `₦${Number(n || 0).toLocaleString("en-NG")}`;

async function send(to, subject, html) {
    if (!process.env.BYTE_SECRET) return;
    try {
        const res = await fetch("https://api.sendbyte.africa/v1/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.BYTE_SECRET}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ from: FROM, to, subject, html }),
        });
        if (!res.ok) console.error("sendbyte send failed", res.status, await res.text());
    } catch (error) {
        console.error("sendbyte send error", error);
    }
}

export async function sendWelcomeEmail(email, username) {
    await send(email, "Welcome!", `<p>Hi ${username}, thanks for registering.</p>`);
}

function orderLines(order) {
    return order.items.map((i) => `<li>${i.quantity} × ${i.name} — ${money(i.price * i.quantity)}</li>`).join("");
}

export async function sendOrderCreatedEmail(email, order) {
    await send(
        email,
        `Order received — #${String(order._id).slice(-8)}`,
        `<p>We received your order.</p><ul>${orderLines(order)}</ul><p>Total: ${money(order.totalAmount)}</p>`,
    );
}

export async function sendOrderPaidEmail(email, order) {
    await send(
        email,
        `Payment confirmed — #${String(order._id).slice(-8)}`,
        `<p>Thanks! Your payment was confirmed.</p><ul>${orderLines(order)}</ul><p>Total: ${money(order.totalAmount)}</p>`,
    );
}
