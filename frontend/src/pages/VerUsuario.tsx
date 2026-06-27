import { useAuth } from "../hooks/useAuth.ts";
import Layout from "../components/Layout/Layout.tsx";
import { UserCard } from "../components/UserCard.tsx";
import type { Usuario } from "../types/Usuario.ts";
import { useFetch } from "../hooks/useFetch.ts";
import { BotonVolver } from "../components/BotónVolver.tsx";
import { usePerfilRolView } from "../hooks/usePerfilRolView.ts";
import { HistorialMedicoCard } from "../components/HistorialMedicoCard.tsx";
import { Container, Row, Col } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import "../assets/styles/Perfil.css"

export function VerUsuario() {
  const { rol } = useAuth();
  const { data: usuarios, loading, error } = useFetch<Usuario[]>("/users.json");
  const paciente = usuarios?.find((u) => u.rol === "paciente");
  const vistaPorRol = usePerfilRolView(paciente, {
    admin: {
      paciente: <HistorialMedicoCard usuario={paciente}/>,
      medico: <p>Soy admin viendo médico</p>,
    },
    medico: {
      paciente: <p>Soy médico viendo paciente</p>,
    },
    paciente: {
      paciente: <p>Soy paciente viendo paciente</p>,
    },
  });
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
                    {paciente && <UserCard usuario={paciente} />}
                </Col>
                <Col md="6" className="col-perfil">
                    {vistaPorRol}
                </Col>
            </Row>
        </Container>
    </Layout>
  );
}
