import { useAuth } from "./useAuth";
import { useNavigate } from "react-router-dom";

export const useLogout = () => {
  const { setRol } = useAuth();
  const navigate = useNavigate();
  const logout = () => {
    setTimeout(() => {
    setRol("unlogged");
    localStorage.removeItem("rol");
    navigate("/");
    }, 500);
  };
  return { logout };
};
