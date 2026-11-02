import { Link } from "react-router-dom";
import { RegistroPacienteForm } from "../components/RegistroPacienteForm";
import imosLogo from "../assets/img/IMOS_LOGO.png";
import "../assets/styles/Login.css";
import "../assets/styles/RegistroCuenta.css";

function AutoregistroPaciente() {
    return (
        <div className="login-page">
            <div className="login-card">
                <section className="login-brand">
                    <img className="login-logo-img" src={imosLogo} alt="IMOS" />
                </section>

                <section className="login-form-panel registro-panel">
                    <h1 className="login-title">Crear cuenta</h1>
                    <p className="login-subtitle">Registrate para poder sacar y gestionar tus turnos online</p>

                    <RegistroPacienteForm modo="autoregistro" />

                    <p className="login-help">
                        ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
                    </p>
                </section>
            </div>
        </div>
    );
}

export default AutoregistroPaciente;
