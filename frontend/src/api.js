const BASE_URL = "http://127.0.0.1:8000/api";

export async function apiFetch(path, options = {}) {
    return await fetch(`${BASE_URL}${path}`, {
      headers: {"Content-Type": "application/json"},
      ...options,
  });
}