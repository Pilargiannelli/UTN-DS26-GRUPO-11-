import Layout from "../components/Layout/Layout.tsx";
import Botones from "../components/botones.tsx";
import ListaReservados from "../components/ListaReservados";
import ContadorTurnos from "../components/ContadorTurnos";
import { TurnosHoy, TurnosPorConfirmar } from "../components/listas";
import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/styles/App.css';

function HomeSecretaria() {
  return (
    <Layout rol="secretaria">
        <Container>
            <Row className="align-items-center justify-content-center">
                <Col>
                    <Botones />
                </Col>
                <Col>
                    <ContadorTurnos />
                </Col>
            </Row>
            <Row>
                <Col>
                    <ListaReservados />
                    <TurnosHoy />
                    <TurnosPorConfirmar />
                </Col>
            </Row>
        </Container>
    </Layout>
    );
}

export default HomeSecretaria;