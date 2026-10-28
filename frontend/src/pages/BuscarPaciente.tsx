import Layout from "../components/Layout/Layout";
import { ListarUsuarios } from "../components/ListarUsuarios";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { ToastMensaje } from "../components/NotifyToast";

function BuscarPaciente() {
    const { tieneRol } = useAuth();
    // Viene de RegistroPacienteForm (modo secretaria) después del 201
    const { showToast, setShowToast } = useToast("pacienteCreado");

    // El paciente no puede acceder al listado general de pacientes (retorna 403)
    if (tieneRol("PACIENTE")) {
        return (
            <Layout>
                <div className="container mt-5 text-center">
                    <div className="alert alert-danger" role="alert">
                        <h4>Acceso Restringido (403)</h4>
                        <p>No tenés permisos para consultar la nómina de pacientes.</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <ToastMensaje
                mensaje="Paciente registrado correctamente"
                tipo="toast-good"
                mostrar={showToast}
                onClose={() => setShowToast(false)}
            />
            <ListarUsuarios rol="paciente" />
        </Layout>
    );
}

export default BuscarPaciente;