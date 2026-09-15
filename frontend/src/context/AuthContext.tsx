import { useEffect, useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContextBase";
import type {
  UsuarioSesion,
  RolUsuario,
  SesionLogin,
} from "../types/UsuarioSesion";
import { apiFetch } from "../services/api";
import {
  obtenerToken,
  guardarToken,
  borrarToken,
} from "../services/sesion";

const USUARIO_KEY = "usuario";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuarioState] = useState<UsuarioSesion | null>(null);
  const [cargando, setCargando] = useState(true);

  const setUsuario = (nuevo: UsuarioSesion | null) => {
    setUsuarioState(nuevo);

    if (nuevo) {
      localStorage.setItem(USUARIO_KEY, JSON.stringify(nuevo));
    } else {
      localStorage.removeItem(USUARIO_KEY);
    }
  };

  const login = (sesion: SesionLogin) => {
    guardarToken(sesion.token);
    setUsuario(sesion.usuario);
  };

  const logout = () => {
    borrarToken();
    setUsuario(null);
  };

  const tieneRol = (rol: RolUsuario) => {
    return usuario?.rol === rol;
  };

  useEffect(() => {
    const rehidratarSesion = async () => {
      const token = obtenerToken();

      if (!token) {
        setUsuario(null);
        setCargando(false);
        return;
      }

      try {
        const usuarioActual =
          await apiFetch<UsuarioSesion>("/auth/yo");

        setUsuario(usuarioActual);
      } catch {
        logout();
      } finally {
        setCargando(false);
      }
    };

    void rehidratarSesion();
  }, []);

  useEffect(() => {
    const manejarSesionExpirada = () => {
      logout();
    };

    window.addEventListener(
      "sesion-expirada",
      manejarSesionExpirada
    );

    return () => {
      window.removeEventListener(
        "sesion-expirada",
        manejarSesionExpirada
      );
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        rol: usuario?.rol ?? null,
        cargando,
        estaAutenticado: usuario !== null,
        setUsuario,
        tieneRol,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};