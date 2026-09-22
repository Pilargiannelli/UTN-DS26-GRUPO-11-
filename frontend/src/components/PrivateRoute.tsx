import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import type { RolUsuario } from "../types/UsuarioSesion";

interface PrivateRouteProps {
  // Sin roles: alcanza con estar logueado. Con roles: además hay que tener uno de esos roles.
  roles?: RolUsuario[];
}

function PrivateRoute({ roles }: PrivateRouteProps) {
  const { usuario, cargando, tieneRol } = useAuth();

  // 1. ¿ya sé quién sos? (rehidratación en curso contra /auth/yo)
  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  // 2. ¿sos alguien? (401)
  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  // 3. ¿podés? (403)
  if (roles && !roles.some(tieneRol)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  // sí: pasá
  return <Outlet />;
}

export default PrivateRoute;
