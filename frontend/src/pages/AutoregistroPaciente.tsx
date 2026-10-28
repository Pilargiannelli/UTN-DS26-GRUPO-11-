import { Link } from "react-router-dom";
import { RegistroPacienteForm } from "../components/RegistroPacienteForm";

function AutoregistroPaciente() {
    return (
        <>
            <h1 className="mt-5 text-center">Crear cuenta</h1>
            <p className="text-center text-muted mb-0">
                ¿Ya tenés cuenta? <Link to="/">Ingresá</Link>
            </p>

            <RegistroPacienteForm modo="autoregistro" />
        </>
    );
}

export default AutoregistroPaciente;
