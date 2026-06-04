import { Container, Row, Col, Button } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../assets/styles/App.css'

interface Turno {
  hora: string;
  paciente: string;
  medico: string;
  obraSocial: string;
  estado?: string;
  confirmar?: boolean;
}

interface TurnosListaProps {
  titulo: string;
  columnas: string[];
  turnos: Turno[];
  mostrarConfirmar?: boolean;
}

function ListaTurnos({ titulo, columnas, turnos, mostrarConfirmar = false,}: TurnosListaProps) {
  return (
    <Container fluid className="my-3 p-3 bg-secondary text-white rounded">
      <h5 className="mb-3">{titulo}</h5>
      <Row className="fw-bold border-bottom pb-2">
        {columnas.map((col, i) => (
          <Col key={i}>{col}</Col>
        ))}
      </Row>
      {turnos.length === 0 ? (
        <Row className="mt-3 text-center text-light">
          <Col>No hay turnos disponibles</Col>
        </Row>
      ) : (
        turnos.map((t, i) => (
          <Row key={i} className="py-2 border-bottom align-items-center">
            <Col>{t.hora}</Col>
            <Col>{t.paciente}</Col>
            <Col>{t.medico}</Col>
            <Col>{t.obraSocial}</Col>
            {t.estado && <Col>{t.estado}</Col>}
            {mostrarConfirmar && (
              <Col>
                <Button variant="light" size="sm">
                  Confirmar
                </Button>
              </Col>
            )}
          </Row>
        ))
      )}
    </Container>
  );
}

export function TurnosHoy() {
  const columnas = ["Hora", "Paciente", "Médico", "Obra Social", "Estado"];
  const turnos = [
    { hora: "09:00", paciente: "Juan Pérez", medico: "Dr. Castellani Mauricio", obraSocial: "Swiss Medical", estado: "Pendiente" },
    { hora: "10:30", paciente: "Ana Ruiz", medico: "Dr. Castellani Mauricio", obraSocial: "PAMI", estado: "Pendiente" },
  ];

  return <ListaTurnos titulo="Turnos de hoy" columnas={columnas} turnos={turnos} />;
}

export function TurnosPorConfirmar() {
  const columnas = ["Hora", "Paciente", "Médico", "Obra Social", "Confirmar"];
  const turnos = [
    { hora: "11:00", paciente: "Carlos Díaz", medico: "Dr. Castellani Mauricio", obraSocial: "Swiss Medical", confirmar: true },
  ];

  return (
    <ListaTurnos titulo="Turnos por Confirmar" columnas={columnas} turnos={turnos} mostrarConfirmar />
  );
}
