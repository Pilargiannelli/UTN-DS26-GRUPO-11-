import Layout from "../components/Layout/Layout.tsx";
import { UserCard } from "../components/UserCard.tsx";
import { BotonVolver } from "../components/BotonVolver.tsx";
import { usePerfilRolView } from "../hooks/usePerfilRolView.ts";
import { useUsuarioSeleccionado } from "../hooks/useUsuarioSeleccionado.ts";
import { HistorialMedicoCard } from "../components/HistorialMedicoCard.tsx";
import { Container, Row, Col } from 'react-bootstrap';
import { useState } from "react";
import type { Usuario } from "../types/Usuario.ts";
import { ConfigMenu } from "../components/ConfigMenu.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../assets/styles/Boton.css";
import "../assets/styles/Perfil.css";
import { useAuth } from "../hooks/useAuth.ts";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/useToast.ts";
import { ToastMensaje } from "../components/NotifyToast.tsx";

interface VerUsuarioProps {
    propio?: boolean;
}

function VerUsuario({ propio = false }: VerUsuarioProps) {
    const { showToast, setShowToast } = useToast("registroExitoso");
    const passwordToast = useToast("passwordActualizada");
    const { usuario, setUsuario, tieneRol } = useAuth();
    const { usuarioSeleccionado, seleccionarUsuario } = useUsuarioSeleccionado();
    const [datosGuardados, setDatosGuardados] = useState(false);

    const usuarioAMostrar = propio ? usuario : usuarioSeleccionado || usuario;

    const esMiPerfil = !!usuario && !!usuarioAMostrar && usuario.id === usuarioAMostrar.id;
    
    // Reglas de permisos: Solo secretaria edita datos, solo el propio usuario cambia contraseña
    const puedeEditar = tieneRol("SECRETARIA");
    const puedeCambiarPassword = esMiPerfil;

    // Si no hay ninguna acción permitida, no se debe mostrar el menú de configuración (tuerca)
    const tieneOpcionesConfig = puedeEditar || puedeCambiarPassword;
    
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const usuarioTipado = usuarioAMostrar as unknown as Usuario;

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

    const handleUpdate = (actualizado: Usuario) => {
        if (!propio) seleccionarUsuario(actualizado);
        if (esMiPerfil && usuario) setUsuario({ ...usuario, ...actualizado, fotoPerfil: actualizado.fotoPerfil ?? null });
        setIsEditing(false);
        setDatosGuardados(true);
    };

    return (
        <Layout>
            <ToastMensaje mensaje="Datos actualizados correctamente" tipo="toast-good" mostrar={showToast} onClose={() => setShowToast(false)} />
            <ToastMensaje mensaje="Datos actualizados correctamente" tipo="toast-good" mostrar={datosGuardados} onClose={() => setDatosGuardados(false)} />
            <ToastMensaje mensaje="Contraseña actualizada" tipo="toast-good" mostrar={passwordToast.showToast} onClose={() => passwordToast.setShowToast(false)} />
            <Container className="cont-perfil">
                <Row className="mb-3">
                    <Col md="6" className="d-flex align-content-start">
                        <BotonVolver />
                    </Col>
                    <Col md="6" className="d-flex justify-content-end align-items-end">
                        {!isEditing && tieneOpcionesConfig && (
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