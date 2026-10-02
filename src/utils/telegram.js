// Telegram admin integration: outbound notifications + a long-polling bot that
// answers /orders and /stats. Everything no-ops unless TELEGRAM_BOT_TOKEN and
// TELEGRAM_ADMIN_CHAT_ID are set, so it is safe to call/start unconditionally.

import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

const api = (method) => `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`;

async function send(chatId, text) {
    try {
        const res = await fetch(api("sendMessage"), {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
        });
        if (!res.ok) console.error("telegram send failed", res.status, await res.text());
    } catch (error) {
        console.error("telegram send error", error);
    }
}

export async function notifyAdmin(text) {
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_ADMIN_CHAT_ID) return;
    await send(process.env.TELEGRAM_ADMIN_CHAT_ID, text);
}

const money = (n) => `₦${Number(n || 0).toLocaleString("en-NG")}`;
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const STATUS = {
    paid: "🟢 Paid",
    pending: "🟡 Pending",
    failed: "🔴 Failed",
};

const when = (d) =>
    new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Africa/Lagos",
    }).format(new Date(d));

async function ordersReport() {
    const orders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("userId", "username")
        .lean();

    if (orders.length === 0) return "📦 <b>Orders</b>\n\n<i>No orders yet.</i>";

    const revenue = orders.filter((o) => o.status === "paid").reduce((s, o) => s + o.totalAmount, 0);

    const blocks = orders.map((o) => {
        const items = o.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;
        const customer = o.userId?.username ? esc(o.userId.username) : "unknown";
        return (
            `${STATUS[o.status] ?? esc(o.status)}  ·  <b>${money(o.totalAmount)}</b>\n` +
            `<code>#${String(o._id).slice(-8)}</code>  ·  ${items} item${items === 1 ? "" : "s"}  ·  👤 ${customer}\n` +
            `<i>${when(o.createdAt)}</i>`
        );
    });

    return (
        `📦 <b>Last ${orders.length} orders</b>\n` +
        `<i>Paid in view: ${money(revenue)}</i>\n\n` +
        blocks.join("\n\n───────────\n\n")
    );
}

// ponytail: Lagos is a fixed UTC+1, no DST — a constant offset is correct here.
const LAGOS_OFFSET_MS = 60 * 60 * 1000;
const lagosDayStartUtc = () => {
    const midnight = new Date(Date.now() + LAGOS_OFFSET_MS).setUTCHours(0, 0, 0, 0);
    return new Date(midnight - LAGOS_OFFSET_MS);
};

async function statsReport() {
    const dayStart = lagosDayStartUtc();
    const [users, products, lowStock, carts, byStatus, today] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Product.countDocuments({ stock: { $lte: 5 }, isActive: true }),
        Cart.countDocuments(),
        Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 }, amount: { $sum: "$totalAmount" } } }]),
        Order.aggregate([
            { $match: { createdAt: { $gte: dayStart } } },
            { $group: { _id: null, count: { $sum: 1 }, paid: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$totalAmount", 0] } } } },
        ]),
    ]);

    const get = (s) => byStatus.find((x) => x._id === s) ?? { count: 0, amount: 0 };
    const paid = get("paid");
    const totalOrders = byStatus.reduce((n, s) => n + s.count, 0);
    const avg = paid.count ? paid.amount / paid.count : 0;
    const t = today[0] ?? { count: 0, paid: 0 };
    const pad = (n) => String(n).padStart(4, " ");

    return [
        "📊 <b>Store Stats</b>",
        `<i>${when(Date.now())} · Africa/Lagos</i>`,
        "",
        "<b>Catalog</b>",
        `<code>${pad(products)}</code> 📦 products${lowStock ? `  ⚠️ ${lowStock} low stock` : ""}`,
        `<code>${pad(users)}</code> 👥 users`,
        `<code>${pad(carts)}</code> 🛒 carts`,
        "",
        "<b>Orders</b>",
        `<code>${pad(totalOrders)}</code> 🧾 total`,
        `<code>${pad(paid.count)}</code> 🟢 paid · ${money(paid.amount)}`,
        `<code>${pad(get("pending").count)}</code> 🟡 pending`,
        `<code>${pad(get("failed").count)}</code> 🔴 failed`,
        "",
        "<b>Revenue</b>",
        `💰 ${money(paid.amount)} total paid`,
        `📈 ${money(Math.round(avg))} avg order`,
        `🗓 ${money(t.paid)} today · ${t.count} order${t.count === 1 ? "" : "s"}`,
    ].join("\n");
}

export function parseCommand(text) {
    return text.trim().split(/\s+/)[0].replace(/@.*$/, "").toLowerCase();
}

async function handleCommand(text) {
    const cmd = parseCommand(text);
    if (cmd === "/orders") return ordersReport();
    if (cmd === "/stats") return statsReport();
    if (cmd === "/start" || cmd === "/help") return "Commands: /orders, /stats";
    return null;
}

// ponytail: single long-poll loop, no library. Fine for one admin chat.
export function startBot() {
    const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_ADMIN_CHAT_ID: adminChatId } = process.env;
    if (!token || !adminChatId) return;

    fetch(api("setMyCommands"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            commands: [
                { command: "orders", description: "Last 10 orders" },
                { command: "stats", description: "Store totals & revenue" },
            ],
        }),
    }).catch(() => {});

    let offset = 0;
    (async function loop() {
        for (;;) {
            try {
                const res = await fetch(api("getUpdates") + `?timeout=30&offset=${offset}`);
                const { result = [] } = await res.json();
                for (const update of result) {
                    offset = update.update_id + 1;
                    const msg = update.message;
                    if (!msg?.text || String(msg.chat.id) !== String(adminChatId)) continue;
                    try {
                        const reply = await handleCommand(msg.text);
                        if (reply) await send(msg.chat.id, reply);
                    } catch (error) {
                        console.error("telegram command error", error);
                        await send(msg.chat.id, "⚠️ command failed");
                    }
                }
            } catch (error) {
                console.error("telegram poll error", error);
                await new Promise((r) => setTimeout(r, 5000));
            }
        }
    })();
    console.log("telegram bot polling started");
}
