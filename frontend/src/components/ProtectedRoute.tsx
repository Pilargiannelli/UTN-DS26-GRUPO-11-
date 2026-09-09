import { Navigate } from "react-router-dom";
import type { Rol } from "../types/AuthUsuario";

interface Props {
  children: React.ReactNode;
  rol: Rol | null;
  permitido: Rol | Rol[];
}

function ProtectedRoute({ children, rol, permitido }: Props) {
  const permitidos = Array.isArray(permitido) ? permitido : [permitido];

  if (!rol || !permitidos.includes(rol)) {
    return <Navigate to="/no-autorizado" />;
  }

  return children;
}

export default ProtectedRoute;
