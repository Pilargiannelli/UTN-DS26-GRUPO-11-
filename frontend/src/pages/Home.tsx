import Layout from "../components/Layout/Layout.tsx";
import ListaReservados from "../components/ListaReservados.tsx";
import ContadorTurnos from "../components/ContadorTurnos.tsx";
import { Container, Row, Col } from 'react-bootstrap';
import { useRolView } from "../hooks/useRolView.ts";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/styles/App.css';

function Home() {
    const vistaPorRol = useRolView({
        admin:
        <Container>
                <Row className="align-items-center justify-content-center">
                    <Col>
                        <ContadorTurnos />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <ListaReservados />
                    </Col>
                </Row>
            </Container>,
        medico: <Container>
                <Row className="align-items-center justify-content-center">
                    <Col>
                        <ContadorTurnos />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <ListaReservados />
                    </Col>
                </Row>
            </Container>,
        paciente: <></>,
      });
    return (
        <Layout rol="admin">
            {vistaPorRol}
        </Layout>
    );
}

export default Home;