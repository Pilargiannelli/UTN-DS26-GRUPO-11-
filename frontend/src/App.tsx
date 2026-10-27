import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home.tsx";
import RegistrarMedico from "./pages/RegistroDeMédico.tsx";
import MisTurnos from "./pages/MisTurnos.tsx";
import RegistroPaciente from "./pages/RegistroPaciente.tsx";
import AutoregistroPaciente from "./pages/AutoregistroPaciente";
import BuscarPaciente from "./pages/BuscarPaciente";
import PrivateRoute from "./components/PrivateRoute";
import NoAutorizado from "./pages/NoAutorizado";
import VerUsuario from "./pages/VerUsuario.tsx";
import RegistroUsuario from "./pages/RegistroUsuario.tsx";
import GestionTurnos from "./pages/GestionTurnos";
import DetalleTurno from "./pages/DetalleTurno.tsx";
import CancelarTurno from "./pages/CancelarTurno.tsx";
import PedirTurno from "./pages/PedirTurno.tsx";
import CambiarPassword from "./pages/CambiarPassword";
import BuscarMedico from "./pages/BuscarMédico.tsx";
import OrdenDelDia from "./pages/OrdenDelDia.tsx";
import HistorialClinico from "./pages/HistorialClinico.tsx";

function App() {
  return (
    <Routes>
      {/* ========================================== */}
      {/* RUTAS PÚBLICAS */}
      {/* ========================================== */}
      <Route path="/" element={<Login />} />
      <Route path="/crear-cuenta" element={<AutoregistroPaciente />} />
      <Route path="/no-autorizado" element={<NoAutorizado />} />

      {/* ========================================== */}
      {/* RUTAS PRIVADAS (Cualquier usuario logueado) */}
      {/* ========================================== */}
      <Route element={<PrivateRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/buscar-medico" element={<BuscarMedico />} />
        <Route path="/ver-perfil" element={<VerUsuario />} />
        <Route path="/cambiar-password" element={<CambiarPassword />} />
        <Route path="/mis-turnos" element={<MisTurnos />} />
        <Route path="/turnos/:id" element={<DetalleTurno />} />
        <Route path="/turnos/:id/cancelar" element={<CancelarTurno />} />
        <Route path="/pedir-turno" element={<PedirTurno />} />
      </Route>

      {/* ========================================== */}
      {/* RUTAS EXCLUSIVAS DE LA SECRETARIA */}
      {/* ========================================== */}
      <Route element={<PrivateRoute roles={["SECRETARIA"]} />}>
        <Route path="/registrar-medico" element={<RegistrarMedico />} />
        <Route path="/registrar-paciente" element={<RegistroPaciente />} />
        <Route path="/registrar-usuario" element={<RegistroUsuario />} />
      </Route>

      {/* ========================================== */}
      {/* RUTAS COMPARTIDAS (SECRETARIA o MEDICO) */}
      {/* ========================================== */}
      <Route element={<PrivateRoute roles={["SECRETARIA", "MEDICO"]} />}>
        <Route path="/buscar-paciente" element={<BuscarPaciente />} />
        <Route path="/gestion-turnos" element={<GestionTurnos />} />
      </Route>

      {/* ========================================== */}
      {/* RUTAS EXCLUSIVAS MÉDICAS */}
      {/* (Solo para el rol MEDICO) */}
      {/* ========================================== */}
      <Route element={<PrivateRoute roles={["MEDICO"]} />}>
        <Route path="/orden-del-dia" element={<OrdenDelDia />} />
        <Route path="/historial" element={<HistorialClinico />} />
      </Route>
    </Routes>
  );
}

export default App;