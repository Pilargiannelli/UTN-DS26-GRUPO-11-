import { useEffect, useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContextBase.ts";
import type { UsuarioSesion } from "../types/UsuarioSesion.ts";
import { apiFetch } from "../services/api.ts";
import { obtenerToken, borrarToken } from "../services/sesion.ts";

const USUARIO_KEY = "usuario";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const usuarioGuardado = localStorage.getItem(USUARIO_KEY);
  const [usuario, setUsuarioState] = useState<UsuarioSesion | null>(
    usuarioGuardado ? (JSON.parse(usuarioGuardado) as UsuarioSesion) : null
  );

  const setUsuario = (nuevo: UsuarioSesion | null) => {
    setUsuarioState(nuevo);
    if (nuevo) {
      localStorage.setItem(USUARIO_KEY, JSON.stringify(nuevo));
    } else {
      localStorage.removeItem(USUARIO_KEY);
    }
  };

  // Si hay token pero la sesión cambió (o el usuario guardado quedó viejo),
  // GET /api/auth/yo la revalida contra el back. Si el token expiró, se limpia.
  useEffect(() => {
    if (!obtenerToken()) return;
    apiFetch<UsuarioSesion>("/auth/yo")
      .then((actual) => setUsuario(actual))
      .catch(() => {
        borrarToken();
        setUsuario(null);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, rol: usuario?.rol ?? null, setUsuario }}>
      {children}
    </AuthContext.Provider>
  );
};
