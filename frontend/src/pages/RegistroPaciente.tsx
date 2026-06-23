import Layout from "../components/Layout/Layout";
import { RegistroPacienteForm } from "../components/RegistroPacienteForm";

function RegistroPaciente() {
return (
    <Layout rol="secretaria">
    <h1 className="mt-5">
        Registrar Paciente
    </h1>
    <RegistroPacienteForm
        esAutoregistro={false}
    />
    </Layout>
);
}
export default RegistroPaciente;