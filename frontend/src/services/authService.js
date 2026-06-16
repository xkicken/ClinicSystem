import api from "./axiosAPI";

function normalizeUser(data) {
    return {
        ...data,
        firstName: data.first_name,
        lastName: data.last_name,
    };
}

export async function checkAuth() {
    try {
        const res = await api.get("/auth/me");
        return normalizeUser(res.data);
    } catch (err) {
        if (err.response?.status === 401) {
            const refreshed = await refreshToken();
            if (!refreshed) return null;

            try {
                const retry = await api.get("/auth/me");
                return normalizeUser(retry.data);
            } catch {
                return null;
            }
        }
        return null;
    }
}

export async function refreshToken() {
    try {
        await api.post("/auth/refresh");
        return true;
    } catch {
        return false;
    }
}

export async function login(username, password) {
    try {
        const res = await api.post("/auth/login", { username, password });
        return normalizeUser(res.data);
    } catch (err) {
        const message = err.response?.data?.message;
        throw new Error(message || "Invalid credentials", { cause: err });
    }
}

export async function logout() {
    try {
        await api.post("/auth/logout");
    } catch {
        return false;
    }
}