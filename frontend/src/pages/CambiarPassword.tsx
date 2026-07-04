import Layout from "../components/Layout/Layout.tsx";
import { BotonVolver } from "../components/BotonVolver.tsx";
import { UserForm } from "../components/CambiarPasswordForm.tsx";

function CambiarPassword() {
  return (
    <Layout>
      <BotonVolver />
      <h4>Cambiar contraseña</h4>
      <UserForm />
    </Layout>
  );
}

export default CambiarPassword;