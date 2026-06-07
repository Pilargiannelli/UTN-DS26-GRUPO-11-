import Layout from "../components/Layout/Layout";
import BuscarPacienteForm from "../components/BuscarPacienteForm";

function BuscarPaciente() {
    return (
        <Layout>
            <h1 className="mt-5 text-center fw-bold text-dark">
                Buscar Paciente
            </h1>
            <BuscarPacienteForm />
        </Layout>
    );
}

export default BuscarPaciente;