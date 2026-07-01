import Layout from "../components/Layout/Layout";
import { ListarUsuarios } from "../components/ListarUsuarios";

function BuscarPaciente() {
    return (
        <Layout>
            <ListarUsuarios rol="paciente" />
        </Layout>
    );
}

export default BuscarPaciente;