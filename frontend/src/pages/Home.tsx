import Layout from "../components/Layout/Layout.tsx";
import { HomePaciente } from "../components/HomePaciente.tsx";
import { useRolView } from "../hooks/useRolView.ts";
import { useAuth } from "../hooks/useAuth.ts";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/styles/App.css';
import { ToastMensaje } from "../components/NotifyToast.tsx";
import { useToast } from "../hooks/useToast.ts";
import GestionTurnos from "./GestionTurnos.tsx";

function Home() {
    const { showToast, setShowToast } = useToast("registroExitoso");
    const { estaAutenticado } = useAuth();

    // Distribución de vistas según la matriz de permisos
    const vistaPorRol = useRolView({
        SECRETARIA: <GestionTurnos />,
        MEDICO: <GestionTurnos />,
        PACIENTE: <HomePaciente />,
    });

    return (
        <Layout>
            <ToastMensaje 
                mensaje="Cuenta creada correctamente" 
                tipo="toast-good" 
                mostrar={showToast} 
                onClose={() => setShowToast(false)} 
            />
            {estaAutenticado ? (
                vistaPorRol
            ) : (
                <div className="container mt-5 text-center">
                    <div className="alert alert-warning" role="alert">
                        <h4>Sesión no iniciada</h4>
                        <p>Por favor, iniciá sesión para acceder al panel principal.</p>
                    </div>
                </div>
            )}
        </Layout>
    );
}

export default Home;