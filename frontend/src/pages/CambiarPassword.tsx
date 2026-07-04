import Layout from "../components/Layout/Layout.tsx";
import { BotonVolver } from "../components/BotonVolver.tsx";
import { NewPasswordForm } from "../components/CambiarPasswordForm.tsx";

function CambiarPassword() {
  return (
    <Layout>
      <BotonVolver />
      <h4>Cambiar contraseña</h4>
      <NewPasswordForm />
    </Layout>
  );
}

export default CambiarPassword;