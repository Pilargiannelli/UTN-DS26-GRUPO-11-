import Layout from "../components/Layout/Layout.tsx";
import { UserForm } from "../components/UserForm.tsx";
import { useAuth } from "../hooks/useAuth";

function RegistroUsuario() {
    const { rol } = useAuth();
    return (
        <Layout rol={rol}>
            <h1 className="mt-5"> Registrar Usuario </h1>
            <UserForm />
        </Layout>
    );
}

export default RegistroUsuario;