import { Routes, Route } from "react-router-dom";
import HomeSecretaria from "./pages/HomeSecretaria.tsx";
import RegistrarMédico from "./pages/RegistroDeMédico.tsx";
import RegistroPaciente from "./pages/RegistroPaciente";
import AutoregistroPaciente from "./pages/AutoregistroPaciente";
import EditarPaciente from "./pages/EditarPaciente";

import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/styles/App.css";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<HomeSecretaria />}
      />

      <Route
        path="/registrar-medico"
        element={<RegistrarMédico />}
      />

      <Route
        path="/registrar-paciente"
        element={<RegistroPaciente />}
      />

      <Route
        path="/crear-cuenta"
        element={<AutoregistroPaciente />}
      />

      <Route
        path="/editar-paciente"
        element={<EditarPaciente />}
      />
    </Routes>
  );
}

export default App;