import Layout from "../components/Layout/Layout.tsx";
import { RegistroPacienteForm } from "../components/RegistroPacienteForm.tsx";
import { BotonVolver } from "../components/BotonVolver.tsx";

function RegistroPaciente() {
    return (
        <Layout>
            <BotonVolver />
            <h1 className="mt-3"> Registrar Paciente </h1>
            <RegistroPacienteForm />
        </Layout>
    );
}

export default RegistroPaciente;