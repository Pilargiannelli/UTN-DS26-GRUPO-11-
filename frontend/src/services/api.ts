import { obtenerToken, borrarToken } from "./sesion";

// URL de la API: sale de VITE_API_URL (frontend/.env en dev, panel de Render en producción).
// Se embebe en el build; si falta, los pedidos fallan a propósito en vez de apuntar a localhost.
const BASE: string = import.meta.env.VITE_API_URL;

// Error de la API con el status y, si es un 400 de Zod, los errores por campo
// (errorHandler del back: { error, detalles: [{ campo, mensaje }] })
export class ApiError extends Error {
  status: number;
  detalles: { campo: string; mensaje: string }[];

  constructor(message: string, status: number, detalles: { campo: string; mensaje: string }[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detalles = detalles;
  }
}

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
    // Solo es "sesión vencida" si mandamos un token. Un 401 sin token es el
    // login con credenciales incorrectas: ese error lo muestra el formulario.
    if (res.status === 401 && token) {
      borrarToken();

      // Notificamos al AuthContext/App
      window.dispatchEvent(new Event("sesion-expirada"));

      // El login vive en "/login" (App.tsx); "/" es la landing
      if (window.location.pathname !== "/login") {
        window.location.href = "/login?expired=true";
      }
    }

    throw new ApiError(
      cuerpo?.error ?? `Error ${res.status}`,
      res.status,
      cuerpo?.detalles ?? []
    );
  }

  return cuerpo as T;
}