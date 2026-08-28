const log = document.getElementById("log");
const anon = document.getElementById("anon");
const authed = document.getElementById("authed");
const whoami = document.getElementById("whoami");

function show(data) {
    log.textContent = JSON.stringify(data, null, 2);
}

function getToken() {
    return localStorage.getItem("token");
}

async function api(path, options = {}) {
    const token = getToken();
    const res = await fetch(path, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...options,
    });
    const data = await res.json().catch(() => ({}));
    show({ status: res.status, ...data });
    return { ok: res.ok, data };
}

async function refreshMe() {
    if (!getToken()) {
        anon.hidden = false;
        authed.hidden = true;
        return;
    }
    const { ok, data } = await api("/users/me");
    if (ok) {
        anon.hidden = true;
        authed.hidden = false;
        whoami.textContent = data.username;
    } else {
        localStorage.removeItem("token");
        anon.hidden = false;
        authed.hidden = true;
    }
}

document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    await api("/auth/register", { method: "POST", body: JSON.stringify(body) });
    e.target.reset();
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    const { ok, data } = await api("/auth/login", { method: "POST", body: JSON.stringify(body) });
    e.target.reset();
    if (ok) {
        localStorage.setItem("token", data.token);
        refreshMe();
    }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    refreshMe();
});

refreshMe();
