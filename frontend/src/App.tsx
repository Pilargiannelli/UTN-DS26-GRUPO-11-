import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Home from "./pages/Home.tsx";
import MisTurnos from "./pages/MisTurnos.tsx";
import RegistroPaciente from "./pages/RegistroPaciente.tsx";
import AutoregistroPaciente from "./pages/AutoregistroPaciente";
import BuscarPaciente from "./pages/BuscarPaciente";
import PrivateRoute from "./components/PrivateRoute";
import NoAutorizado from "./pages/NoAutorizado";
import VerUsuario from "./pages/VerUsuario.tsx";
import GestionTurnos from "./pages/GestionTurnos";
import DetalleTurno from "./pages/DetalleTurno.tsx";
import CancelarTurno from "./pages/CancelarTurno.tsx";
import PedirTurno from "./pages/PedirTurno.tsx";
import BuscarMedico from "./pages/BuscarMédico.tsx";
import OrdenDelDia from "./pages/OrdenDelDia.tsx";
import FichaPaciente from "./pages/FichaPaciente.tsx";
import HistorialConsultas from "./pages/HistorialConsultas.tsx";
import TurnosPaciente from "./pages/TurnosPaciente.tsx";
import NoEncontrada from "./pages/NoEncontrada.tsx";
import Layout from "./components/Layout/Layout.tsx";

function App() {
  return (
    <Routes>
      {/* ========================================== */}
      {/* RUTAS PÚBLICAS */}
      {/* ========================================== */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/crear-cuenta" element={<AutoregistroPaciente />} />
      <Route path="/no-autorizado" element={<NoAutorizado />} />

      {/* ========================================== */}
      {/* RUTAS PRIVADAS (Cualquier usuario logueado) */}
      {/* ========================================== */}
      <Route element={<PrivateRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/buscar-medico" element={<BuscarMedico />} />
        <Route path="/ver-perfil" element={<VerUsuario />} />
        <Route path="/mi-cuenta" element={<VerUsuario propio />} />
        <Route path="/mis-turnos" element={<MisTurnos />} />
        <Route path="/turnos/:id" element={<DetalleTurno />} />
        <Route path="/turnos/:id/cancelar" element={<CancelarTurno />} />
        <Route path="/pedir-turno" element={<PedirTurno />} />
      </Route>

      {/* ========================================== */}
      {/* RUTAS EXCLUSIVAS DE LA SECRETARIA */}
      {/* ========================================== */}
      <Route element={<PrivateRoute roles={["SECRETARIA"]} />}>
        {/* HU-001: el alta de pacientes es del personal administrativo */}
        <Route path="/registrar-paciente" element={<RegistroPaciente />} />
      </Route>

      {/* ========================================== */}
      {/* RUTAS COMPARTIDAS (SECRETARIA o MEDICO) */}
      {/* ========================================== */}
      <Route element={<PrivateRoute roles={["SECRETARIA", "MEDICO"]} />}>
        <Route path="/buscar-paciente" element={<BuscarPaciente />} />
        {/* Ficha de cada paciente, con su propia dirección (datos, turnos e
            historia clínica en un solo lugar) */}
        <Route path="/pacientes/:id" element={<FichaPaciente />} />
        {/* GestionTurnos no trae Layout propio (Home lo usa adentro del suyo) */}
        <Route path="/gestion-turnos" element={<Layout><GestionTurnos /></Layout>} />
      </Route>

      {/* ========================================== */}
      {/* RUTAS EXCLUSIVAS DEL MÉDICO */}
      {/* La historia clínica y los turnos propios del paciente */}
      {/* ========================================== */}
      <Route element={<PrivateRoute roles={["MEDICO"]} />}>
        <Route path="/pacientes/:id/historial" element={<HistorialConsultas />} />
        <Route path="/pacientes/:id/turnos" element={<TurnosPaciente />} />
      </Route>

      {/* ========================================== */}
      {/* AGENDA */}
      {/* El médico ve la suya; la secretaria, la de cada médico */}
      {/* ========================================== */}
      <Route element={<PrivateRoute roles={["MEDICO", "SECRETARIA"]} />}>
        <Route path="/orden-del-dia" element={<OrdenDelDia />} />
      </Route>

      {/* Cualquier otra URL: página 404 en vez de pantalla en blanco */}
      <Route path="*" element={<NoEncontrada />} />
    </Routes>
  );
}

export default App;