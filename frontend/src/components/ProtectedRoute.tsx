import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  rol: string;
  permitido: string;
}

function ProtectedRoute({ children, rol, permitido }: Props) {
  if (rol !== permitido) {
    return <Navigate to="/no-autorizado" />;
  }

  return children;
}

export default ProtectedRoute;