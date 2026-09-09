import { useAuth } from "./useAuth";
import { useNavigate } from "react-router-dom";
import { borrarToken } from "../services/sesion";

export const useLogout = () => {
  const { setRol, setUsuario } = useAuth();
  const navigate = useNavigate();
  const logout = () => {
    setTimeout(() => {
      borrarToken();
      setRol(null);
      setUsuario(null);
      navigate("/");
    }, 500);
  };
  return { logout };
};
