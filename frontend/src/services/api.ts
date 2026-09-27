import { obtenerToken, borrarToken } from "./sesion";

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
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const cuerpo = await res.json().catch(() => null);

  if (!res.ok) {
    // 🚨 MANEJO DE TOKEN VENCIDO / NO AUTORIZADO (401)
    if (res.status === 401) {
      borrarToken();

      // Notificamos al AuthContext/App
      window.dispatchEvent(new Event("sesion-expirada"));

      // Redirigimos al login si no estamos ahí
      if (window.location.pathname !== "/login") {
        window.location.href = "/login?expired=true";
      }
    }

    throw new Error(
      cuerpo?.error ?? `Error ${res.status}`
    );
  }

  return cuerpo as T;
}