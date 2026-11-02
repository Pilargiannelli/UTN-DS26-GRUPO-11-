import { useState } from "react";
import { CalendarEvent, CalendarPlus, Flag, HeartPulse, Person } from "react-bootstrap-icons";

import {
  Modal,
  Button,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";

import "../../assets/styles/ModalTurno.css";
import "../../assets/styles/NuevoTurnoModal.css";

import { turnoSchema } from "../../schemas/TurnoSchema";
import { apiFetch, ApiError } from "../../services/api";
import { useFetch } from "../../hooks/useFetch";
import { SelectorTurno } from "../SelectorTurno";
import { BuscadorSelect } from "./BuscadorSelect";
import type { Turno, MedicoTurno, PacienteTurno } from "../../types/Turno";

interface NuevoTurnoModalProps {
  show: boolean;
  onClose: () => void;
  onAgregar: (turno: Turno) => void;
  // "Dar turno" desde el listado o el perfil de un paciente: el modal abre con ese paciente y no se puede cambiar
  pacienteIdInicial?: number;
}

function NuevoTurnoModal({
  show,
  onClose,
  onAgregar,
  pacienteIdInicial,
}: NuevoTurnoModalProps) {


  // GET /api/medicos es público; GET /api/pacientes exige SECRETARIA o
  // MEDICO (matriz de permisos, secciones 6 y 7) — es justamente quien usa
  // esta pantalla.
  const { data: medicos } = useFetch<MedicoTurno[]>("/medicos");
  const { data: pacientes } = useFetch<PacienteTurno[]>("/pacientes");

  const [form, setForm] = useState({
    pacienteId: pacienteIdInicial ? String(pacienteIdInicial) : "",
    medicoId: "",
    fecha: "",
    hora: "",
    estado: "Pendiente" as "Pendiente" | "Confirmado",
  });

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const [recargarOcupados, setRecargarOcupados] = useState(0);

  const elegirFecha = (fecha: string) => {
    setForm((prev) => ({ ...prev, fecha, hora: "" }));
    setErrores((prev) => ({ ...prev, fecha: "", hora: "" }));
  };

  const elegirHora = (hora: string) => {
    setForm((prev) => ({ ...prev, hora }));
    setErrores((prev) => ({ ...prev, hora: "" }));
  };

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
      // Otro médico u otro día: el horario elegido puede no estar libre
      ...((name === "medicoId" || name === "fecha") && { hora: "" }),
    }));

    if (errores[name]) {

      setErrores((prev) => ({
        ...prev,
        [name]: "",
      }));

    }

  };

  const elegirOpcion = (name: "pacienteId" | "medicoId", value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // Otro médico: el horario elegido puede no estar libre
      ...(name === "medicoId" && { hora: "" }),
    }));
    setErrores((prev) => ({ ...prev, [name]: "" }));
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

    // Días hábiles, horario laboral y fecha futura ya los garantiza el
    // SelectorTurno (no ofrece otra cosa), y el back los vuelve a validar.

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

      // Sin navegar: la tabla ya muestra el turno nuevo (onAgregar). Navegar a
      // /gestion-turnos sacaba al usuario del Layout (sin header ni menú).
      onClose();

    } catch (error) {

      // 401 sin token, 403 con rol PACIENTE, 400 si Zod rechaza el body:
      // el mensaje real lo manda apiFetch, no uno genérico.
      setErrorApi(error instanceof Error ? error.message : "Error al registrar el turno");

      // 409: alguien tomó ese horario mientras tanto -> refrescar la grilla
      if (error instanceof ApiError && error.status === 409) {
        setForm((prev) => ({ ...prev, hora: "" }));
        setRecargarOcupados((n) => n + 1);
      }

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
      dialogClassName="modal-nuevo-turno"
    >

      <Modal.Header
        closeButton
        closeLabel="Cerrar"
        className="modal-header-turno"
      >

        <span className="nt-icono" aria-hidden="true"><CalendarPlus /></span>

        <div>

          <h3 className="m-0 fw-bold">Nuevo Turno</h3>

          <small className="text-muted">
            Programá una nueva consulta médica
          </small>

        </div>

      </Modal.Header>

      <Modal.Body>

        {errorApi && <Alert variant="danger">{errorApi}</Alert>}

        <Form>

          <div className="nt-fila">

            <Form.Group className="nt-seccion">

              <Form.Label className="nt-titulo"><Person aria-hidden="true" />Paciente</Form.Label>

              <BuscadorSelect
                ariaLabel="Paciente"
                placeholder="Buscar paciente por nombre o DNI"
                value={form.pacienteId}
                onChange={(v) => elegirOpcion("pacienteId", v)}
                invalido={!!errores.pacienteId}
                bloqueado={pacienteIdInicial !== undefined}
                opciones={pacientes?.map((p) => ({
                  value: String(p.id),
                  etiqueta: `${p.usuario.nombre} ${p.usuario.apellido}`,
                  detalle: p.usuario.dni ? `DNI ${p.usuario.dni}` : undefined,
                }))}
              />

              {errores.pacienteId && <div className="nt-error">{errores.pacienteId}</div>}

            </Form.Group>

            <Form.Group className="nt-seccion">

              <Form.Label className="nt-titulo"><HeartPulse aria-hidden="true" />Médico</Form.Label>

              <BuscadorSelect
                ariaLabel="Médico"
                placeholder="Buscar médico o especialidad"
                value={form.medicoId}
                onChange={(v) => elegirOpcion("medicoId", v)}
                invalido={!!errores.medicoId}
                opciones={medicos?.map((m) => ({
                  value: String(m.id),
                  etiqueta: `Dr./Dra. ${m.usuario.nombre} ${m.usuario.apellido}`,
                  detalle: m.especialidad,
                }))}
              />

              {errores.medicoId && <div className="nt-error">{errores.medicoId}</div>}

            </Form.Group>

          </div>

          {/* Día y horario: la tira muestra cuántos horarios libres le quedan a
              cada día del médico; los ocupados y los ya pasados no se eligen */}
          <Form.Group className="nt-seccion">

            <Form.Label className="nt-titulo"><CalendarEvent aria-hidden="true" />Día y horario</Form.Label>

            <SelectorTurno
              medicoId={form.medicoId}
              fecha={form.fecha}
              hora={form.hora}
              onFecha={elegirFecha}
              onHora={elegirHora}
              recargar={recargarOcupados}
            />

            {(errores.fecha || errores.hora) && (
              <div className="nt-error">{errores.fecha || errores.hora}</div>
            )}

          </Form.Group>

          <Form.Group className="nt-seccion">

            <Form.Label className="nt-titulo"><Flag aria-hidden="true" />Estado</Form.Label>

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

              {/* Un turno nuevo no nace Cancelado ni Reprogramado */}
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
          className="nt-cancelar"
          onClick={onClose}
          disabled={enviando}
        >
          Cancelar
        </Button>

        <Button
          variant="success"
          className="nt-guardar"
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
