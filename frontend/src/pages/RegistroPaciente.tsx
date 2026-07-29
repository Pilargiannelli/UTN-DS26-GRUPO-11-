import Layout from "../components/Layout/Layout.tsx";
import { RegistroPacienteForm } from "../components/RegistroPacienteForm.tsx";
import { BotonVolver } from "../components/BotonVolver.tsx";

function RegistroPaciente() {
    return (
        <Layout>
            <BotonVolver destino="/buscar-paciente" />
            <RegistroPacienteForm />
        </Layout>
    );
}

export default RegistroPaciente;