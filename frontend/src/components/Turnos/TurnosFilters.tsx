import { Row, Col, Button } from "react-bootstrap";

interface TurnosFiltersProps {
  onNuevoTurno: () => void;
}

function TurnosFilters({
  onNuevoTurno,
}: TurnosFiltersProps) {

  return (

    <Row className="justify-content-center mb-4">

      <Col xs="auto">

        <Button
          variant="success"
          size="lg"
          onClick={onNuevoTurno}
        >
          + Nuevo Turno
        </Button>

      </Col>

    </Row>

  );

}

export default TurnosFilters;