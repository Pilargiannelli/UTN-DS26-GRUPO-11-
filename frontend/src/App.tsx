import { Routes, Route } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import HomeSecretaria from "./pages/HomeSecretaria";
import RegistrarMedico from "./pages/RegistroDeMédico";
import RegistroPaciente from "./pages/RegistroPaciente";
import AutoregistroPaciente from "./pages/AutoregistroPaciente";
import BuscarPaciente from "./pages/BuscarPaciente";
import EditarPaciente from "./pages/EditarPaciente";
import ProtectedRoute from "./components/ProtectedRoute";
import NoAutorizado from "./pages/NoAutorizado";

function App() {
  const { rol } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      {/* Rutas generales */}
      <Route path="/admin/home" element={<HomeSecretaria />} />
      <Route path="/registrar-medico" element={<RegistrarMedico />} />
      <Route path="/registrar-paciente" element={<RegistroPaciente />} />
      <Route path="/crear-cuenta" element={<AutoregistroPaciente />} />
      <Route path="/buscar-paciente" element={<BuscarPaciente />} />
      <Route path="/editar-paciente" element={<EditarPaciente />} />
      {/* Rutas protegidas */}
      <Route
        path="/historial"
        element={
          <ProtectedRoute rol={rol} permitido="medico">
            <h1>Historial Clínico</h1>
          </ProtectedRoute>
        }
      />
      {/* Página de error o acceso denegado */}
      <Route path="/no-autorizado" element={<NoAutorizado />} />
    </Routes>
  );
}

export default App;
