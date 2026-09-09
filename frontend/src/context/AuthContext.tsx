import { useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContextBase.ts";
import type { AuthUsuario, Rol } from "../types/AuthUsuario";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const usuarioGuardado = localStorage.getItem("usuario");
  const [usuario, setUsuarioState] = useState<AuthUsuario | null>(
    usuarioGuardado ? JSON.parse(usuarioGuardado) : null
  );
  const [rol, setRolState] = useState<Rol | null>(usuario?.rol ?? null);

  const setUsuario = (usuario: AuthUsuario | null) => {
    setUsuarioState(usuario);
    if (usuario) localStorage.setItem("usuario", JSON.stringify(usuario));
    else localStorage.removeItem("usuario");
  };

  const setRol = (rol: Rol | null) => {
    setRolState(rol);
    if (rol) localStorage.setItem("rol", rol);
    else localStorage.removeItem("rol");
  };

  return (
    <AuthContext.Provider value={{ rol, setRol, usuario, setUsuario }}>
      {children}
    </AuthContext.Provider>
  );
};
