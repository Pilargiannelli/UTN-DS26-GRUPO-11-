import { RegistroPacienteForm } from "../components/RegistroPacienteForm";
function AutoregistroPaciente() {

    return (
    <>
    <h1 className="mt-5 text-center">
        Crear Cuenta
    </h1>

    <RegistroPacienteForm
        esAutoregistro={true}
    />
    </>
);
}
export default AutoregistroPaciente;