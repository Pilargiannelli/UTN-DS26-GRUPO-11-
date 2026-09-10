import { createContext } from "react";
import type { UsuarioSesion, RolUsuario } from "../types/UsuarioSesion";

export interface AuthContextType {
  usuario: UsuarioSesion | null;
  rol: RolUsuario | null;
  setUsuario: (usuario: UsuarioSesion | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  usuario: null,
  rol: null,
  setUsuario: () => {},
});
