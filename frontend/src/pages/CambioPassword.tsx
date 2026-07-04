import Layout from "../components/Layout/Layout.tsx";
import { NewPasswordForm } from "../components/CambiarPasswordForm.tsx";

function CambioPassword() {
    return (
        <Layout>
            <h1 className="mt-5"> Cambiar contraseña </h1>
            <NewPasswordForm />
        </Layout>
    );
}

export default CambioPassword;