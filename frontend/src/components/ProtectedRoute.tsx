import { Navigate } from "react-router-dom";
import type { RolUsuario } from "../types/UsuarioSesion";

interface Props {
  children: React.ReactNode;
  rol: RolUsuario | null;
  permitido: RolUsuario;
}

function ProtectedRoute({ children, rol, permitido }: Props) {
  if (rol !== permitido) {
    return <Navigate to="/no-autorizado" />;
  }

  return children;
}

export default ProtectedRoute;
