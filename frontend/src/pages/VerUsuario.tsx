import { useAuth } from "../hooks/useAuth.ts";
import Layout from "../components/Layout/Layout.tsx";
import { UserCard } from "../components/UserCard.tsx";
import type { Usuario } from "../types/Usuario.ts";
import { useFetch } from "../hooks/useFetch.ts";
import { BotonVolver } from "../components/BotonVolver.tsx";
import { usePerfilRolView } from "../hooks/usePerfilRolView.ts";
import { useUsuarioSeleccionado } from "../hooks/useUsuarioSeleccionado.ts";
import { HistorialMedicoCard } from "../components/HistorialMedicoCard.tsx";
import { Container, Row, Col } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import "../assets/styles/Boton.css"
import "../assets/styles/Perfil.css"

export function VerUsuario() {
    const { rol } = useAuth();
    const { data: loading, error } = useFetch<Usuario[]>("/users.json");
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
    if (loading) return <p>Cargando...</p>;
    if (error) return <p>Error</p>;
    return (
        <Layout rol={rol}>
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
