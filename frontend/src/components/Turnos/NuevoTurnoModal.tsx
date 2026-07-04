import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
} from "react-bootstrap";

import "../../assets/styles/ModalTurno.css";

import { turnoSchema } from "../../schemas/TurnoSchema";
import type { Turno } from "../../types/Turno";

interface NuevoTurnoModalProps {
  show: boolean;
  onClose: () => void;
  onAgregar: (turno: Turno) => void;
}

function NuevoTurnoModal({
  show,
  onClose,
  onAgregar,
}: NuevoTurnoModalProps) {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    paciente: "",
    medico: "",
    especialidad: "",
    fecha: "",
    hora: "",
    obraSocial: "",
    estado: "Pendiente" as
      | "Pendiente"
      | "Confirmado"
      | "Cancelado",
  });

  const [errores, setErrores] = useState<
    Record<string, string>
  >({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >
  ) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };

  const limpiarFormulario = () => {

    setForm({
      paciente: "",
      medico: "",
      especialidad: "",
      fecha: "",
      hora: "",
      obraSocial: "",
      estado: "Pendiente",
    });

    setErrores({});

  };

  const guardarTurno = () => {

    const resultado =
      turnoSchema.safeParse(form);

    if (!resultado.success) {

      const nuevosErrores:
        Record<string, string> = {};

      resultado.error.issues.forEach(issue => {

        nuevosErrores[
          issue.path[0].toString()
        ] = issue.message;

      });

      setErrores(nuevosErrores);

      return;

    }

    setErrores({});

    const nuevoTurno: Turno = {

      id: Date.now(),

      ...resultado.data,

    };

    onAgregar(nuevoTurno);

    limpiarFormulario();

    onClose();

    navigate("/gestion-turnos");

  };

  return (

    <Modal
      show={show}
      onHide={onClose}
      centered
      size="lg"
    >

      <Modal.Header
        closeButton
        className="modal-header-turno"
      >

        <div>

          <h3 className="m-0 fw-bold">
            🗓️ Nuevo Turno
          </h3>

          <small className="text-muted">
            Programá una nueva consulta médica
          </small>

        </div>

      </Modal.Header>

      <Modal.Body>

        <Form>

          <Form.Group className="mb-3">

            <Form.Label>Paciente</Form.Label>

            <Form.Control
              name="paciente"
              value={form.paciente}
              onChange={handleChange}
              isInvalid={!!errores.paciente}
            />

            <Form.Control.Feedback type="invalid">
              {errores.paciente}
            </Form.Control.Feedback>

          </Form.Group>

          <Form.Group className="mb-3">

            <Form.Label>Médico</Form.Label>

            <Form.Select
              name="medico"
              value={form.medico}
              onChange={handleChange}
              isInvalid={!!errores.medico}
            >

              <option value="">
                Seleccione un médico
              </option>

              <option>Dr. Font</option>

              <option>Dr. Castelli</option>

              <option>Dr. Messi</option>

            </Form.Select>

            <Form.Control.Feedback type="invalid">
              {errores.medico}
            </Form.Control.Feedback>

          </Form.Group>

          <Form.Group className="mb-3">

            <Form.Label>Especialidad</Form.Label>

            <Form.Control
              name="especialidad"
              value={form.especialidad}
              onChange={handleChange}
              isInvalid={!!errores.especialidad}
            />

            <Form.Control.Feedback type="invalid">
              {errores.especialidad}
            </Form.Control.Feedback>

          </Form.Group>

          <Row className="mb-3">

            <Col md={6}>

              <Form.Group>

                <Form.Label>Fecha</Form.Label>

                <Form.Control
                  type="date"
                  name="fecha"
                  value={form.fecha}
                  onChange={handleChange}
                  isInvalid={!!errores.fecha}
                />

                <Form.Control.Feedback type="invalid">
                  {errores.fecha}
                </Form.Control.Feedback>

              </Form.Group>

            </Col>

            <Col md={6}>

              <Form.Group>

                <Form.Label>Hora</Form.Label>

                <Form.Control
                  type="time"
                  name="hora"
                  value={form.hora}
                  onChange={handleChange}
                  isInvalid={!!errores.hora}
                />

                <Form.Control.Feedback type="invalid">
                  {errores.hora}
                </Form.Control.Feedback>

              </Form.Group>

            </Col>

          </Row>

          <Form.Group className="mb-3">

            <Form.Label>Obra Social</Form.Label>

            <Form.Control
              name="obraSocial"
              value={form.obraSocial}
              onChange={handleChange}
              isInvalid={!!errores.obraSocial}
            />

            <Form.Control.Feedback type="invalid">
              {errores.obraSocial}
            </Form.Control.Feedback>

          </Form.Group>

        </Form>

      </Modal.Body>

      <Modal.Footer>

        <Button
          variant="secondary"
          onClick={onClose}
        >
          Cancelar
        </Button>

        <Button
          variant="success"
          onClick={guardarTurno}
        >
          Guardar Turno
        </Button>

      </Modal.Footer>

    </Modal>

  );

}

export default NuevoTurnoModal;