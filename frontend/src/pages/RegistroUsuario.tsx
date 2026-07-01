import Layout from "../components/Layout/Layout.tsx";
import { UserForm } from "../components/UserForm.tsx";

function RegistroUsuario() {
    return (
        <Layout>
            <h1 className="mt-5"> Registrar Usuario </h1>
            <UserForm />
        </Layout>
    );
}

export default RegistroUsuario;