import Layout from "../components/Layout/Layout";
import { ListarUsuarios } from "../components/ListarUsuarios";
import { useAuth } from "../hooks/useAuth";

function BuscarPaciente() {
    const { rol } = useAuth();
    return (
        <Layout rol={rol}>
            <ListarUsuarios rol="paciente" />
        </Layout>
    );
}

export default BuscarPaciente;