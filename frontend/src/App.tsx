import { Routes, Route } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Home from "./pages/Home.tsx";
import RegistrarMedico from "./pages/RegistroDeMédico.tsx";
import MisTurnos from "./pages/MisTurnos.tsx";
import RegistroPaciente from "./pages/RegistroPaciente.tsx";
import AutoregistroPaciente from "./pages/AutoregistroPaciente";
import BuscarPaciente from "./pages/BuscarPaciente";
import ProtectedRoute from "./components/ProtectedRoute";
import NoAutorizado from "./pages/NoAutorizado";
import VerUsuario from "./pages/VerUsuario.tsx";
import RegistroUsuario from "./pages/RegistroUsuario.tsx";
import DetalleTurno from "./pages/DetalleTurno.tsx";
import CancelarTurno from "./pages/CancelarTurno.tsx";
import PedirTurno from "./pages/PedirTurno.tsx";
import CambiarPassword from "./pages/CambiarPassword.tsx";
import BuscarMedico from "./pages/BuscarMédico.tsx";

function App() {
  const { rol } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      {/* Rutas generales */}
      <Route path="/home" element={<Home />} />
      <Route path="/registrar-medico" element={<RegistrarMedico />} />
      <Route path="/mis-turnos" element={<MisTurnos />} />
      <Route path="/registrar-paciente" element={<RegistroPaciente />} />
      <Route path="/crear-cuenta" element={<AutoregistroPaciente />} />
      <Route path="/buscar-paciente" element={<BuscarPaciente />} />
      <Route path="/buscar-medico" element={<BuscarMedico/>} />
      <Route path="/ver-perfil" element={<VerUsuario />} />
      <Route path="/registrar-usuario" element={<RegistroUsuario/>} />
      <Route path="/turnos/:id" element={<DetalleTurno />} />
      <Route path="/turnos/:id/cancelar" element={<CancelarTurno />} />
      <Route path="/pedir-turno" element={<PedirTurno />} />
      <Route path="/cambiar-password" element={<CambiarPassword />} />
      

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