import type { EspecialidadSelectProps } from "../types/EspecialidadSelectProps";
import { Form } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/styles/App.css';

export function EspecialidadSelect({ especialidades, value, onChange }: EspecialidadSelectProps) {
  return (
    <Form.Group className="mb-3" controlId="especialidad">
      <Form.Label className="d-flex me-auto">Especialidad</Form.Label>
      <Form.Select
        name="especialidad"
        id="especialidadForm"
        value={value}
        onChange={onChange}
        required
      >
        <option value="">Seleccione una especialidad</option>
        {especialidades.map((especialidad) => (
          <option key={especialidad} value={especialidad}>
            {especialidad}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
}
