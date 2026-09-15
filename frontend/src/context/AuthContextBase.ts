import { createContext } from "react";
import type {
  UsuarioSesion,
  RolUsuario,
  SesionLogin,
} from "../types/UsuarioSesion";

export interface AuthContextType {
  usuario: UsuarioSesion | null;
  rol: RolUsuario | null;
  cargando: boolean;
  estaAutenticado: boolean;
  setUsuario: (usuario: UsuarioSesion | null) => void;
  tieneRol: (rol: RolUsuario) => boolean;
  login: (sesion: SesionLogin) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);