import { createContext } from "react";
import type { AuthUsuario, Rol } from "../types/AuthUsuario";

export interface AuthContextType {
  rol: Rol | null;
  setRol: (rol: Rol | null) => void;
  usuario: AuthUsuario | null;
  setUsuario: (usuario: AuthUsuario | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  rol: null,
  setRol: () => {},
  usuario: null,
  setUsuario: () => {},
});
