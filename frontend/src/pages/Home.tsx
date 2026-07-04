import Layout from "../components/Layout/Layout.tsx";
import ListaReservados from "../components/ListaReservados.tsx";
import ContadorTurnos from "../components/ContadorTurnos.tsx";
import { HomePaciente } from "../components/HomePaciente.tsx";
import { Container, Row, Col } from 'react-bootstrap';
import { useRolView } from "../hooks/useRolView.ts";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/styles/App.css';
import { ToastMensaje } from "../components/NotifyToast.tsx";
import { useToast } from "../hooks/useToast.ts";

function Home() {
    const { showToast, setShowToast } = useToast("registroExitoso");
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
        paciente: <HomePaciente />,
      });
    return (
        <Layout>
            <ToastMensaje mensaje="Cuenta creada correctamente" tipo="toast-good" mostrar={showToast} onClose={() => setShowToast(false)} />
            {vistaPorRol}
        </Layout>
    );
}

export default Home;