import { useState } from "react";
import {
  Container,
  Spinner,
  Alert,
} from "react-bootstrap";

import HeroTurnos from "../components/Turnos/HeroTurnos";
import DashboardCards from "../components/Turnos/DashboardCards";

import TurnosTable from "../components/Turnos/TurnosTable";
import NuevoTurnoModal from "../components/Turnos/NuevoTurnoModal";

import { useAuth } from "../hooks/useAuth";
import { useFetch } from "../hooks/useFetch";

import type { Turno } from "../types/Turno";

function GestionTurnos() {

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

  const horaActual = ahora.toLocaleTimeString(
    "es-AR",
    {
      hour: "2-digit",
      minute: "2-digit",
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
  // Dashboard: los que quedan hoy y, por estado, todos los próximos
  // (el Médico ya recibe solo su agenda desde el back)
  // ==========================================

  const turnosDeHoy = proximos.filter(
    (t) => new Date(t.fechaHora) < finDeHoy && t.estado !== "Cancelado"
  ).length;

  const pendientes = proximos.filter((t) => t.estado === "Pendiente" || t.estado === "Reprogramado").length;

  const confirmados = proximos.filter((t) => t.estado === "Confirmado").length;

  const cancelados = proximos.filter((t) => t.estado === "Cancelado").length;

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
      <Container className="mt-3">

        <HeroTurnos

          secretaria={nombreUsuario}

          proximoPaciente={
            proximoTurno
              ? `${proximoTurno.paciente.usuario.nombre} ${proximoTurno.paciente.usuario.apellido}`
              : "Sin turnos"
          }

          especialidad={
            proximoTurno
              ? proximoTurno.medico.especialidad
              : "-"
          }

          fecha={fechaActual}

          hora={horaActual}

        />

        <DashboardCards

          total={turnosDeHoy}

          pendientes={pendientes}

          confirmados={confirmados}

          cancelados={cancelados}

        />


        <TurnosTable

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
