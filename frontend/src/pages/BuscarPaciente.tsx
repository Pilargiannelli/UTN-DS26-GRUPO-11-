import Layout from "../components/Layout/Layout";
import { ListarUsuarios } from "../components/ListarUsuarios";
import { useAuth } from "../hooks/useAuth";

function BuscarPaciente() {
    const { tieneRol } = useAuth();

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
            <ListarUsuarios rol="paciente" />
        </Layout>
    );
}

export default BuscarPaciente;