import Layout from "../components/Layout/Layout.tsx";
import { HomePaciente } from "../components/HomePaciente.tsx";
import { useRolView } from "../hooks/useRolView.ts";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/styles/App.css';
import { ToastMensaje } from "../components/NotifyToast.tsx";
import { useToast } from "../hooks/useToast.ts";
import GestionTurnos from "./GestionTurnos.tsx";

function Home() {
    const { showToast, setShowToast } = useToast("registroExitoso");
    const vistaPorRol = useRolView({
        admin: <GestionTurnos />,
        medico: <GestionTurnos />,
        paciente: <HomePaciente />,
      });
    return (
        <Layout>
            <ToastMensaje mensaje="Cuenta creada correctamente" tipo="toast-good" mostrar={showToast} onClose={() => setShowToast(false)} />
            {vistaPorRol}
        </Layout>
    );
}

export default Home;