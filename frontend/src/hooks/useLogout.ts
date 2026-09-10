import { useAuth } from "./useAuth";
import { useNavigate } from "react-router-dom";
import { borrarToken } from "../services/sesion";

export const useLogout = () => {
  const { setUsuario } = useAuth();
  const navigate = useNavigate();
  const logout = () => {
    setTimeout(() => {
      borrarToken();
      setUsuario(null);
      navigate("/");
    }, 500);
  };
  return { logout };
};
