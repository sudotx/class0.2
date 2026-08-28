const log = document.getElementById("log");
const keyPanel = document.getElementById("keyPanel");
const apiKeyValue = document.getElementById("apiKeyValue");

function show(data) {
    log.textContent = JSON.stringify(data, null, 2);
}

async function api(path, options = {}) {
    const res = await fetch(path, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    const data = await res.json().catch(() => ({}));
    show({ status: res.status, ...data });
    return { ok: res.ok, data };
}

document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    await api("/auth/register", { method: "POST", body: JSON.stringify(body) });
    e.target.reset();
});

document.getElementById("issueForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    const { ok, data } = await api("/auth/api-keys", { method: "POST", body: JSON.stringify(body) });
    e.target.reset();
    if (ok) {
        apiKeyValue.textContent = data.apiKey;
        keyPanel.hidden = false;
    }
});

document.getElementById("callProtectedBtn").addEventListener("click", () => {
    api("/users/me", { headers: { "x-api-key": apiKeyValue.textContent } });
});
