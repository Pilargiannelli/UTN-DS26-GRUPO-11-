import { useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContextBase.ts";
import type { Usuario } from "../types/Usuario.ts";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [rol, setRol] = useState<string>(
    localStorage.getItem("rol") || "unlogged"
  );
  const usuarioGuardado = localStorage.getItem("usuario");
  const [usuario, setUsuario] = useState<Usuario|null>(
    usuarioGuardado ? JSON.parse(usuarioGuardado) : null
  );
  return (
    <AuthContext.Provider value={{ rol, setRol, usuario, setUsuario }}>
      {children}
    </AuthContext.Provider>
  );
};
