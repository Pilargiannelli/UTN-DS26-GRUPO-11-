import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar3, CalendarEvent, CalendarPlus, CheckCircle, PersonPlus, ChevronRight } from "react-bootstrap-icons";
import { saludoSegunHora } from "../utils/saludo";
import {
  Container,
  Spinner,
  Alert,
} from "react-bootstrap";

import { EncabezadoPagina } from "../components/EncabezadoPagina";
import HeroTurnos from "../components/Turnos/HeroTurnos";

import TurnosTable from "../components/Turnos/TurnosTable";
import NuevoTurnoModal from "../components/Turnos/NuevoTurnoModal";

import { useAuth } from "../hooks/useAuth";
import { useFetch } from "../hooks/useFetch";

import "../assets/styles/MedicoTheme.css";
import "../assets/styles/SecretariaTurnos.css";
import type { Turno } from "../types/Turno";

function GestionTurnos({ recepcion = false }: { recepcion?: boolean }) {

  const [showModal, setShowModal] = useState(false);

  const { usuario } = useAuth();

  const nombreUsuario =
    usuario?.rol === "MEDICO"
      ? `Dr. ${usuario.apellido}`
      : usuario?.nombre ?? "Secretaría";

  // GET /api/turnos ya filtra por identidad en el back (matriz de permisos,
  // sección 8): la Secretaria ve todos, el Médico sólo su agenda.
  const {
    data,
    loading,
    error,
  } = useFetch<Turno[]>("/turnos");

  // Turnos que se confirmaron o cancelaron desde la tabla: pisan al que vino
  // en el GET para no tener que volver a pedir toda la lista
  const [actualizados, setActualizados] = useState<Record<number, Turno>>({});

  // Alta de turno: la crea NuevoTurnoModal contra POST /api/turnos. Acá solo
  // se suma a la lista el turno que devolvió el back (201).
  const [turnosNuevos, setTurnosNuevos] = useState<Turno[]>([]);

  const agregarTurno = (nuevoTurno: Turno) => {
    setTurnosNuevos((prev) => [...prev, nuevoTurno]);
  };

  const actualizarTurno = (turno: Turno) => {
    setActualizados((prev) => ({ ...prev, [turno.id]: turno }));
  };

  // Una sola lista (los del GET + los creados acá, con sus cambios): de ella
  // salen la tabla, los contadores y el próximo paciente
  const todosLosTurnos = [...(data ?? []), ...turnosNuevos]
    .map((t) => actualizados[t.id] ?? t)
    .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));

  // ==========================================
  // Fecha y hora actual
  // ==========================================

  const ahora = new Date();
  const finDeHoy = new Date(ahora);
  finDeHoy.setHours(0, 0, 0, 0);
  finDeHoy.setDate(finDeHoy.getDate() + 1);

  const fechaActual = ahora.toLocaleDateString(
    "es-AR",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  // El panel muestra solo los turnos que todavía no pasaron (los de días
  // anteriores, y los de hoy que ya fueron, se consultan en la Agenda)
  const proximos = todosLosTurnos.filter((t) => new Date(t.fechaHora) >= ahora);

  // ==========================================
  // Próximo turno: el primero que todavía no pasó y no está cancelado
  // ==========================================

  const proximoTurno = todosLosTurnos.find(
    (t) => t.estado !== "Cancelado" && new Date(t.fechaHora) >= ahora
  );

  // ==========================================
  // Resumen del encabezado: los que quedan hoy y los pendientes de confirmar
  // (el Médico ya recibe solo su agenda desde el back)
  // ==========================================

  const turnosDeHoy = proximos.filter(
    (t) => new Date(t.fechaHora) < finDeHoy && t.estado !== "Cancelado"
  ).length;

  const pendientes = proximos.filter((t) => t.estado === "Pendiente" || t.estado === "Reprogramado").length;

    // ==========================================
  // Loading
  // ==========================================

  if (loading) {

    return (
        <Container className="mt-5 text-center">

          <Spinner
            animation="border"
            variant="success"
          />

        </Container>
    );

  }

  // ==========================================
  // Error
  // ==========================================

  if (error) {

    return (
        <Container className="mt-5">

          <Alert variant="danger">

            {error.message}

          </Alert>

        </Container>
    );

  }

  // ==========================================
  // Render
  // ==========================================

  return (
      <Container className={`mt-3 ${recepcion ? "" : "gestion-turnos-page"}`}>

        {recepcion ? (
          <header className="recepcion-bienvenida">
            <div className="recepcion-intro">
              <span className="recepcion-etiqueta">Recepción · Secretaría</span>
              <h1>{saludoSegunHora()}, <span className="recepcion-nombre">{nombreUsuario}</span></h1>
              <p className="recepcion-fecha"><CalendarEvent aria-hidden="true" /><span>{fechaActual}</span></p>
              <Link to="/orden-del-dia" className="recepcion-resumen">
                <Calendar3 aria-hidden="true" />
                <strong>{turnosDeHoy}</strong> {turnosDeHoy === 1 ? "turno por atender hoy" : "turnos por atender hoy"}<ChevronRight aria-hidden="true" />
              </Link>
            </div>
            <nav className="recepcion-accesos" aria-label="Acciones de recepción">
              <button type="button" className="recepcion-atajo recepcion-atajo-principal" onClick={() => setShowModal(true)}>
                <span className="atajo-icono"><CalendarPlus aria-hidden="true" /></span>
                <strong>Agendar turno</strong><span>Cargá un nuevo turno<br />en el sistema.</span>
                <ChevronRight className="atajo-flecha" aria-hidden="true" />
              </button>
              <Link className="recepcion-atajo" to="/orden-del-dia">
                <span className="atajo-icono"><Calendar3 aria-hidden="true" /></span>
                <strong>Ver agenda</strong><span>Consultá la agenda<br />de profesionales.</span>
                <ChevronRight className="atajo-flecha" aria-hidden="true" />
              </Link>
              <Link className="recepcion-atajo recepcion-atajo-paciente" to="/registrar-paciente">
                <span className="atajo-icono"><PersonPlus aria-hidden="true" /></span>
                <strong>Registrar paciente</strong><span>Cargá un nuevo paciente<br />en el sistema.</span>
                <ChevronRight className="atajo-flecha" aria-hidden="true" />
              </Link>
            </nav>
          </header>
        ) : usuario?.rol === "SECRETARIA" ? (
          <EncabezadoPagina titulo="Turnos" etiqueta="Gestión del consultorio" icono={<Calendar3 />} descripcion="Organizá las próximas atenciones y revisá el estado de cada turno."
            datos={[{ valor: turnosDeHoy, texto: "Por atender hoy", icono: <CalendarEvent /> }, { valor: pendientes, texto: "Por confirmar", icono: <CheckCircle /> }]} />
        ) : <HeroTurnos
          rol={usuario?.rol ?? null}
          nombre={nombreUsuario}
          fecha={fechaActual}
          turnosDeHoy={turnosDeHoy}
          pendientes={pendientes}
          proximoTurno={proximoTurno ?? null}
        />}


        <TurnosTable
          recepcion={recepcion}

          turnos={proximos}

          onNuevoTurno={() =>
            setShowModal(true)
          }

          onTurnoActualizado={actualizarTurno}

        />

        <NuevoTurnoModal

          show={showModal}

          onClose={() =>
            setShowModal(false)
          }

          onAgregar={agregarTurno}

        />

      </Container>
  );

}

export default GestionTurnos;
