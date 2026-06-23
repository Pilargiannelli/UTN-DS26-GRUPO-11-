import Layout from "../components/Layout/Layout.tsx";
import { RegistroMedicoForm } from "../components/RegistroMédicoForm.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/styles/App.css';

function RegistrarMédico() {
  return (
    <Layout rol="secretaria">
      <h1 className="mt-5">Registrar Médico</h1>
      <RegistroMedicoForm />
    </Layout>
  );
}

export default RegistrarMédico;