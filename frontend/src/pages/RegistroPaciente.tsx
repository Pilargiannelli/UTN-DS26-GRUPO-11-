import { PersonPlus } from "react-bootstrap-icons";
import { EncabezadoPagina } from "../components/EncabezadoPagina";
import Layout from "../components/Layout/Layout.tsx";
import { RegistroPacienteForm } from "../components/RegistroPacienteForm.tsx";
import { BotonVolver } from "../components/BotonVolver.tsx";

function RegistroPaciente() {
    return (
        <Layout>
            <BotonVolver destino="/buscar-paciente" />
            <EncabezadoPagina titulo="Registrar paciente" etiqueta="Pacientes" icono={<PersonPlus />} descripcion="Datos personales, contacto y cobertura médica del paciente." />
            <RegistroPacienteForm modo="secretaria" />
        </Layout>
    );
}

export default RegistroPaciente;