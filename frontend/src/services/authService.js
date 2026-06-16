const API = "http://localhost:8000/api";

function normalizeUser(data) {
    return{
        ...data,
        firstName: data.first_name,
        lastName: data.last_name
    };
}
export async function checkAuth() {
    const res = await fetch(`${API}/auth/me`, {
        credentials: "include",
    });

    if (res.status === 401) {
        const refreshed = await refreshToken();
        if (!refreshed) return null;

        const retry = await fetch(`${API}/auth/me`, {
            credentials: "include",
        });
        if (!retry.ok) return null;
        return normalizeUser(await retry.json());
    }

    if (!res.ok) return null;
    return normalizeUser(await res.json());
}

export async function refreshToken() {
    try {
        const res = await fetch(`${API}/auth/refresh`, {
            method: "POST",
            credentials: "include",
        });
        return res.ok;
    } catch {
        return false;
    }
}

export async function login(username, password) {
    const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
        const err = normalizeUser(await res.json());
        throw new Error(err.message || "Invalid credentials");
    }

    return normalizeUser(await res.json());
}

export async function logout() {
    try {
        await fetch(`${API}/auth/logout`, {
            method: "POST",
            credentials: "include",
        });
    } catch {return false;
    }
}