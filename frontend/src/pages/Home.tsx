import Layout from "../components/Layout/Layout.tsx";
import ListaReservados from "../components/ListaReservados.tsx";
import ContadorTurnos from "../components/ContadorTurnos.tsx";
import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/styles/App.css';

function Home() {
  return (
    <Layout rol="admin">
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
        </Container>
    </Layout>
    );
}

export default Home;