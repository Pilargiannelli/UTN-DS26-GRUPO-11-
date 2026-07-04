import Layout from "../components/Layout/Layout";
import { ListarUsuarios } from "../components/ListarUsuarios";

function BuscarMedico() {
    return (
        <Layout>
            <ListarUsuarios rol="medico" />
        </Layout>
    );
}

export default BuscarMedico;