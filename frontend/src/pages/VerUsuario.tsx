import Layout from "../components/Layout/Layout.tsx";
import { UserCard } from "../components/UserCard.tsx";
import { BotonVolver } from "../components/BotonVolver.tsx";
import { usePerfilRolView } from "../hooks/usePerfilRolView.ts";
import { useUsuarioSeleccionado } from "../hooks/useUsuarioSeleccionado.ts";
import { HistorialMedicoCard } from "../components/HistorialMedicoCard.tsx";
import { Container, Row, Col } from 'react-bootstrap'
import { useState } from "react";
import type { UserProps } from "../types/UserProps.ts";
import type { MedicoProps } from "../types/MedicoProps.ts";
import type { PacienteProps } from "../types/PacienteProps.ts";
import { ConfigMenu } from "../components/ConfigMenu.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../assets/styles/Boton.css"
import "../assets/styles/Perfil.css"

export function VerUsuario() {
    const { usuarioSeleccionado } = useUsuarioSeleccionado();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const vistaPorRol = usePerfilRolView(usuarioSeleccionado, {
        admin: {
            paciente: <HistorialMedicoCard usuario={usuarioSeleccionado!}/>,
        },
        medico: {
            paciente: <HistorialMedicoCard usuario={usuarioSeleccionado!}/>,
        },
        paciente: {
            paciente: <HistorialMedicoCard usuario={usuarioSeleccionado!}/>,
        },
    });
    if (!usuarioSeleccionado) return <p>No hay usuario seleccionado.</p>;
    const handleUpdate = (updatedDocs: PacienteProps | MedicoProps | UserProps) => {
        console.log("Datos actualizados recibidos en la página:", updatedDocs);
        // Futura lógica de persistencia
        setIsEditing(false);
    };
    return (
        <Layout>
            <Container className="cont-perfil h-75">
                <Row>
                    <Col md="6" className="d-flex align-content-start">
                        <BotonVolver />
                    </Col>
                    <Col md="6" className="d-flex justify-content-end align-items-end">
                        {!isEditing && (
                            <ConfigMenu onEditClick={() => setIsEditing(true)} />
                        )}
                    </Col>
                </Row>
                <Row className="row-perfil">
                    <Col md="6" className="col-perfil">
                        {usuarioSeleccionado && <UserCard usuario={usuarioSeleccionado} isEditing={isEditing} onEditingChange={setIsEditing} onUpdate={handleUpdate} />}
                    </Col>
                    <Col md="6" className="col-perfil">
                        {vistaPorRol}
                    </Col>
                </Row>
            </Container>
        </Layout>
    );
}
