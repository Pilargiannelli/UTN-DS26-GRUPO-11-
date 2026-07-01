import Layout from "../components/Layout/Layout.tsx";
import { RegistroPacienteForm } from "../components/RegistroPacienteForm.tsx";

function RegistroPaciente() {
    return (
        <Layout>
            <h1 className="mt-5"> Registrar Paciente </h1>
            <RegistroPacienteForm />
        </Layout>
    );
}

export default RegistroPaciente;