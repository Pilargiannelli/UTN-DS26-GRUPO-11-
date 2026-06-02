import { Routes, Route } from "react-router-dom";
import HomeSecretaria from "./pages/HomeSecretaria";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeSecretaria />} />
    </Routes>
  );
}

export default App;