import { obtenerToken } from "./sesion";

const BASE = import.meta.env.VITE_API_URL;

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = obtenerToken();

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...options.headers,
    },
  });

  const cuerpo = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401 && token) {
      window.dispatchEvent(
        new Event("sesion-expirada")
      );
    }

    throw new Error(
      cuerpo?.error ?? `Error ${res.status}`
    );
  }

  return cuerpo as T;
}