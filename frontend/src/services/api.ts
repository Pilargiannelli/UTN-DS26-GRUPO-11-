import { obtenerToken, borrarToken } from "./sesion";

// Fallback por si la variable de entorno de Vite no se inyectó en el build
const ENV_URL = import.meta.env.VITE_API_URL;
const BASE = (ENV_URL && ENV_URL !== "undefined") ? ENV_URL : "http://localhost:3000/api";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = obtenerToken();

  // Asegura formato limpio del path y evita duplicar el prefijo /api
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const finalPath = cleanPath.startsWith("/api/") ? cleanPath : `/api${cleanPath}`;

  // Remueve /api del final de BASE si existiera para concatenar sin solapamientos
  const baseUrlWithoutApi = BASE.replace(/\/api\/?$/, "");

  const res = await fetch(`${baseUrlWithoutApi}${finalPath}`, {
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