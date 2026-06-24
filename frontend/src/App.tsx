import { Routes, Route } from "react-router-dom";

import Header from "./components/Layout/Header";
import ProtectedRoute from "./components/ProtectedRoute";

import HomeSecretaria from "./pages/HomeSecretaria";
import RegistrarMédico from "./pages/RegistroDeMédico";
import RegistroPaciente from "./pages/RegistroPaciente";
import AutoregistroPaciente from "./pages/AutoregistroPaciente";
import Login from "./pages/Login";                           
import NoAutorizado from "./pages/NoAutorizado";
import BuscarPaciente from "./pages/BuscarPaciente";
import EditarPaciente from "./pages/EditarPaciente";


import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/styles/App.css";

function App() {
  const rol = "secretaria";

  return (
    <>
      <Header rol={rol} />

      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/admin/home" element={<HomeSecretaria />} />

        <Route path="/registrar-medico" element={<RegistrarMédico />} />

        <Route path="/registrar-paciente" element={<RegistroPaciente />} />

        <Route path="/crear-cuenta" element={<AutoregistroPaciente />} />

        <Route path="/buscar-paciente" element={<BuscarPaciente />} />

        <Route path="/editar-paciente" element={<EditarPaciente />} />

        <Route
          path="/historial"
          element={
            <ProtectedRoute rol={rol} permitido="medico">
              <h1>Historial Clinico</h1>
            </ProtectedRoute>
          }
        />

        <Route path="/no-autorizado" element={<NoAutorizado />} />
      </Routes>
    </>
  );
}

export default App;