const BASE_URL = "http://localhost:8000/api";

export async function apiFetch(path, options = {}) {
    return await fetch(`${BASE_URL}${path}`, {
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        ...options,
    });
}