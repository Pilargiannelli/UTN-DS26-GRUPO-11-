import { createContext } from "react";
import type { Usuario } from "../types/Usuario";

export interface AuthContextType {
  rol: string;
  setRol: (rol: string) => void;
  usuario: Usuario|null;
  setUsuario: (usuario: Usuario|null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  rol: "unlogged",
  setRol: () => {},
  usuario: null,
  setUsuario: () => {},
});