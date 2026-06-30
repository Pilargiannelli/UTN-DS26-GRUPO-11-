import Layout from "../components/Layout/Layout.tsx";
import { RegistroPacienteForm } from "../components/RegistroPacienteForm.tsx";
import { useAuth } from "../hooks/useAuth";

function RegistroPaciente() {
    const { rol } = useAuth();
    return (
        <Layout rol={rol}>
            <h1 className="mt-5"> Registrar Paciente </h1>
            <RegistroPacienteForm />
        </Layout>
    );
}

export default RegistroPaciente;