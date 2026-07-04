import { Row, Col, Form, Button, InputGroup } from "react-bootstrap";

interface TurnosFiltersProps {
  onNuevoTurno: () => void;
}

function TurnosFilters({ onNuevoTurno }: TurnosFiltersProps) {
  return (
    <Row className="align-items-end mb-4">

      {/* Buscar paciente */}
      <Col md={4}>
        <Form.Group>
          <Form.Label>Buscar paciente</Form.Label>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Nombre o DNI"
            />
          </InputGroup>
        </Form.Group>
      </Col>

      {/* Estado */}
      <Col md={2}>
        <Form.Group>
          <Form.Label>Estado</Form.Label>
          <Form.Select>
            <option>Todos</option>
            <option>Pendiente</option>
            <option>Confirmado</option>
            <option>Cancelado</option>
            <option>Reprogramado</option>
          </Form.Select>
        </Form.Group>
      </Col>

      {/* Médico */}
      <Col md={3}>
        <Form.Group>
          <Form.Label>Médico</Form.Label>
          <Form.Select>
            <option>Todos</option>
            <option>Dr. Font</option>
            <option>Dr. Castelli</option>
            <option>Dr. Messi</option>
          </Form.Select>
        </Form.Group>
      </Col>

      {/* Botón */}
      <Col md={3} className="text-end">
        <Button
            variant="primary"
            className="w-100"
            onClick={onNuevoTurno}
        >
        + Nuevo Turno
        </Button>
      </Col>

    </Row>
  );
}

export default TurnosFilters;