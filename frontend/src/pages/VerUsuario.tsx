import Layout from "../components/Layout/Layout.tsx";
import { UserCard } from "../components/UserCard.tsx";
import { BotonVolver } from "../components/BotonVolver.tsx";
import { usePerfilRolView } from "../hooks/usePerfilRolView.ts";
import { useUsuarioSeleccionado } from "../hooks/useUsuarioSeleccionado.ts";
import { HistorialMedicoCard } from "../components/HistorialMedicoCard.tsx";
import { Container, Row, Col } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import "../assets/styles/Boton.css"
import "../assets/styles/Perfil.css"

export function VerUsuario() {
    const { usuarioSeleccionado } = useUsuarioSeleccionado();
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
    return (
        <Layout>
            <Container className="cont-perfil h-75">
                <Row className="d-flex align-content-start">
                    <BotonVolver />
                </Row>
                <Row className="row-perfil">
                    <Col md="6" className="col-perfil">
                        {usuarioSeleccionado && <UserCard usuario={usuarioSeleccionado} />}
                    </Col>
                    <Col md="6" className="col-perfil">
                        {vistaPorRol}
                    </Col>
                </Row>
            </Container>
        </Layout>
    );
}
