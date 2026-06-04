import { Routes, Route } from "react-router-dom";
import HomeSecretaria from "./pages/HomeSecretaria.tsx";
import RegistrarMédico from "./pages/RegistroDeMédico.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/styles/App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeSecretaria />} />
      <Route path="/registrar-medico" element={<RegistrarMédico />} />
    </Routes>
  );
}

export default App;