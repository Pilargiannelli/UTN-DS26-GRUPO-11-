import Layout from "../components/Layout/Layout.tsx";
import { UserCard } from "../components/UserCard.tsx";
import { BotonVolver } from "../components/BotonVolver.tsx";
import { usePerfilRolView } from "../hooks/usePerfilRolView.ts";
import { useUsuarioSeleccionado } from "../hooks/useUsuarioSeleccionado.ts";
import { HistorialMedicoCard } from "../components/HistorialMedicoCard.tsx";
import { Container, Row, Col } from 'react-bootstrap';
import { useState } from "react";
import type { UserProps } from "../types/UserProps.ts";
import type { MedicoProps } from "../types/MedicoProps.ts";
import type { PacienteProps } from "../types/PacienteProps.ts";
import type { Usuario } from "../types/Usuario.ts"; // Tipo estricto
import { ConfigMenu } from "../components/ConfigMenu.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../assets/styles/Boton.css";
import "../assets/styles/Perfil.css";
import { useAuth } from "../hooks/useAuth.ts";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/useToast.ts";
import { ToastMensaje } from "../components/NotifyToast.tsx";

function VerUsuario() {
    const { showToast, setShowToast } = useToast("registroExitoso");
    // Viene de CambiarPassword después del PATCH /auth/password
    const passwordToast = useToast("passwordActualizada");
    const { usuario } = useAuth();
    const { usuarioSeleccionado } = useUsuarioSeleccionado();

    // Fallback inteligente: si no hay un usuario seleccionado, muestra el perfil del usuario logueado actual
    const usuarioAMostrar = usuarioSeleccionado || usuario;

    const esMiPerfil = !!usuario && !!usuarioAMostrar && usuario.id === usuarioAMostrar.id;
    const rolActual = String(usuario?.rol ?? "").toLowerCase();
    const puedeEditar = rolActual === "admin" || rolActual === "administrador" || rolActual === "secretaria";
    const puedeCambiarPassword = esMiPerfil;
    
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState<boolean>(false);

    // Casteo tipado y estricto utilizando la interfaz Usuario en lugar de 'any'
    const usuarioTipado = usuarioAMostrar as unknown as Usuario;

    // Historia clínica al costado del perfil de un paciente. Las claves son los
    // roles reales (en mayúscula): quien mira -> rol del perfil. La SECRETARIA
    // no la ve (matriz §10); el paciente ve la suya.
    const pacienteId = usuarioTipado?.paciente?.id;
    const historiaClinica = pacienteId ? <HistorialMedicoCard pacienteId={pacienteId} /> : null;
    const vistaPorRol = usePerfilRolView(usuarioTipado, {
        MEDICO: { PACIENTE: historiaClinica },
        PACIENTE: { PACIENTE: historiaClinica },
    });

    if (!usuarioAMostrar) {
        return (
            <Layout>
                <Container className="cont-perfil text-center mt-5">
                    <BotonVolver />
                    <p className="text-muted mt-3">No hay usuario seleccionado ni sesión activa.</p>
                </Container>
            </Layout>
        );
    }

    const handleUpdate = (updatedDocs: PacienteProps | MedicoProps | UserProps) => {
        console.log("Datos actualizados recibidos en la página:", updatedDocs);
        setIsEditing(false);
    };

    return (
        <Layout>
            <ToastMensaje mensaje="Datos actualizados correctamente" tipo="toast-good" mostrar={showToast} onClose={() => setShowToast(false)} />
            <ToastMensaje mensaje="Contraseña actualizada" tipo="toast-good" mostrar={passwordToast.showToast} onClose={() => passwordToast.setShowToast(false)} />
            <Container className="cont-perfil">
                <Row className="mb-3">
                    <Col md="6" className="d-flex align-content-start">
                        <BotonVolver />
                    </Col>
                    <Col md="6" className="d-flex justify-content-end align-items-end">
                        {!isEditing && (
                            <ConfigMenu 
                                canEdit={puedeEditar} 
                                canChangePassword={puedeCambiarPassword as boolean} 
                                onEditClick={() => setIsEditing(true)} 
                                onPasswordClick={() => navigate("/cambiar-password")} 
                            />
                        )}
                    </Col>
                </Row>
                <Row className="row-perfil">
                    <Col md="6" className="col-perfil">
                        <UserCard 
                            usuario={usuarioTipado} 
                            isEditing={isEditing} 
                            onEditingChange={setIsEditing} 
                            onUpdate={handleUpdate} 
                        />
                    </Col>
                    <Col md="6" className="col-perfil">
                        {vistaPorRol}
                    </Col>
                </Row>
            </Container>
        </Layout>
    );
}

export default VerUsuario;