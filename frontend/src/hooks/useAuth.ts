import { useContext } from "react";
import { AuthContext } from "../context/AuthContextBase";

export const useAuth = () => {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return contexto;
};