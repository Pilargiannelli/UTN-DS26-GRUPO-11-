import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Spinner,
} from "react-bootstrap";

import "../../assets/styles/ModalTurno.css";

import { turnoSchema } from "../../schemas/TurnoSchema";
import { apiFetch } from "../../services/api";
import { useFetch } from "../../hooks/useFetch";
import type { Turno, MedicoTurno, PacienteTurno } from "../../types/Turno";

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

  // GET /api/medicos es público; GET /api/pacientes exige SECRETARIA o
  // MEDICO (matriz de permisos, secciones 6 y 7) — es justamente quien usa
  // esta pantalla.
  const { data: medicos } = useFetch<MedicoTurno[]>("/medicos");
  const { data: pacientes } = useFetch<PacienteTurno[]>("/pacientes");

  const [form, setForm] = useState({
    pacienteId: "",
    medicoId: "",
    fecha: "",
    hora: "",
    estado: "Pendiente" as
      | "Pendiente"
      | "Confirmado"
      | "Cancelado"
      | "Reprogramado",
  });

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [errorApi, setErrorApi] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >
  ) => {

    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errores[name]) {

      setErrores((prev) => ({
        ...prev,
        [name]: "",
      }));

    }

  };

  const limpiarFormulario = () => {

    setForm({
      pacienteId: "",
      medicoId: "",
      fecha: "",
      hora: "",
      estado: "Pendiente",
    });

    setErrores({});
    setErrorApi(null);

  };

  const guardarTurno = async () => {

    setErrorApi(null);

    // ==========================
    // Validación con Zod
    // ==========================

    const resultado = turnoSchema.safeParse(form);

    if (!resultado.success) {

      const nuevosErrores: Record<string, string> = {};

      resultado.error.issues.forEach((issue) => {

        nuevosErrores[
          issue.path[0].toString()
        ] = issue.message;

      });

      setErrores(nuevosErrores);

      return;

    }

    // ==========================
    // Fecha no anterior a hoy
    // ==========================

    const hoy = new Date()
      .toISOString()
      .split("T")[0];

    if (form.fecha < hoy) {

      setErrores({
        fecha:
          "No es posible registrar turnos en fechas anteriores a hoy.",
      });

      return;

    }

    // ==========================
    // Horario laboral
    // ==========================

    const [hora, minutos] =
      form.hora.split(":").map(Number);

    const horario = hora * 60 + minutos;

    if (
      horario < 8 * 60 ||
      horario > 20 * 60
    ) {

      setErrores({
        hora:
          "El horario debe estar entre las 08:00 y las 20:00.",
      });

      return;

    }

    // ==========================
    // Cada 30 minutos
    // ==========================

    if (
      minutos !== 0 &&
      minutos !== 30
    ) {

      setErrores({
        hora:
          "Los turnos sólo pueden registrarse cada 30 minutos.",
      });

      return;

    }

    // ==========================
    // POST /api/turnos con el token (lo agrega apiFetch solo)
    // ==========================

    const { pacienteId, medicoId, estado } = resultado.data;
    const fechaHora = new Date(`${form.fecha}T${form.hora}:00`).toISOString();

    setEnviando(true);

    try {

      const nuevoTurno = await apiFetch<Turno>("/turnos", {
        method: "POST",
        body: JSON.stringify({ pacienteId, medicoId, estado, fechaHora }),
      });

      onAgregar(nuevoTurno);

      limpiarFormulario();

      onClose();

      navigate("/gestion-turnos", {
        replace: true,
      });

    } catch (error) {

      // 401 sin token, 403 con rol PACIENTE, 400 si Zod rechaza el body:
      // el mensaje real lo manda apiFetch, no uno genérico.
      setErrorApi(error instanceof Error ? error.message : "Error al registrar el turno");

    } finally {

      setEnviando(false);

    }

  };

  return (
        <Modal
      show={show}
      onHide={onClose}
      centered
      scrollable
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

        {errorApi && <Alert variant="danger">{errorApi}</Alert>}

        <Form>

          <Form.Group className="mb-3">

            <Form.Label>Paciente</Form.Label>

            <Form.Select
              name="pacienteId"
              value={form.pacienteId}
              onChange={handleChange}
              isInvalid={!!errores.pacienteId}
            >

              <option value="">
                {pacientes ? "Seleccione un paciente" : "Cargando pacientes..."}
              </option>

              {(pacientes ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.usuario.nombre} {p.usuario.apellido}
                  {p.usuario.dni ? ` (DNI ${p.usuario.dni})` : ""}
                </option>
              ))}

            </Form.Select>

            <Form.Control.Feedback type="invalid">
              {errores.pacienteId}
            </Form.Control.Feedback>

          </Form.Group>

          <Form.Group className="mb-3">

            <Form.Label>Médico</Form.Label>

            <Form.Select
              name="medicoId"
              value={form.medicoId}
              onChange={handleChange}
              isInvalid={!!errores.medicoId}
            >

              <option value="">
                {medicos ? "Seleccione un médico" : "Cargando médicos..."}
              </option>

              {(medicos ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  Dr./Dra. {m.usuario.nombre} {m.usuario.apellido} — {m.especialidad}
                </option>
              ))}

            </Form.Select>

            <Form.Control.Feedback type="invalid">
              {errores.medicoId}
            </Form.Control.Feedback>

          </Form.Group>

          <Row>

            <Col md={6}>

              <Form.Group className="mb-3">

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

              <Form.Group className="mb-3">

                <Form.Label>Hora</Form.Label>

                <Form.Control
                  type="time"
                  name="hora"
                  step="1800"
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

          <Form.Group className="mb-4">

            <Form.Label>Estado</Form.Label>

            <Form.Select
              name="estado"
              value={form.estado}
              onChange={handleChange}
              isInvalid={!!errores.estado}
            >

              <option value="Pendiente">
                Pendiente
              </option>

              <option value="Confirmado">
                Confirmado
              </option>

              <option value="Cancelado">
                Cancelado
              </option>

              <option value="Reprogramado">
                Reprogramado
              </option>

            </Form.Select>

            <Form.Control.Feedback type="invalid">
              {errores.estado}
            </Form.Control.Feedback>

          </Form.Group>

        </Form>

      </Modal.Body>

      <Modal.Footer>

        <Button
          variant="outline-secondary"
          onClick={onClose}
          disabled={enviando}
        >
          Cancelar
        </Button>

        <Button
          variant="success"
          onClick={guardarTurno}
          disabled={enviando}
        >
          {enviando ? <Spinner size="sm" animation="border" /> : "Guardar Turno"}
        </Button>

      </Modal.Footer>

    </Modal>

  );

}

export default NuevoTurnoModal;
