import Layout from "../components/Layout/Layout";
import { ListarUsuarios } from "../components/ListarUsuarios";
import { useAuth } from "../hooks/useAuth";

function BuscarMedico() {
    const { tieneRol } = useAuth();
    // Identificamos si el usuario actual es médico para habilitar acciones administrativas
    const esMedico = tieneRol("MEDICO");

    return (
        <Layout>
            <ListarUsuarios rol="medico" esAdmin={esMedico} />
        </Layout>
    );
}

export default BuscarMedico;