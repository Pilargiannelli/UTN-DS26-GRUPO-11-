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

  const turnos = (data ?? []).map((t) => actualizados[t.id] ?? t);

  const turnosOrdenados = [...turnos].sort(
    (a, b) => a.fechaHora.localeCompare(b.fechaHora)
  );

  // ==========================================
  // Fecha y hora actual
  // ==========================================

  const ahora = new Date();

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

  // ==========================================
  // Próximo turno
  // ==========================================

  const proximoTurno = turnosOrdenados.find(
    turno => turno.estado !== "Cancelado"
  );

  // ==========================================
  // Dashboard
  // ==========================================

  // El Médico ya recibe sólo su propia agenda desde el back; no hace falta
  // volver a filtrar acá.
  const totalTurnos = turnosOrdenados.length;

  const pendientes =
    turnosOrdenados.filter(
      t => t.estado === "Pendiente"
    ).length;

  const confirmados =
    turnosOrdenados.filter(
      t => t.estado === "Confirmado"
    ).length;

  const cancelados =
    turnosOrdenados.filter(
      t => t.estado === "Cancelado"
    ).length;

  // ==========================================
  // Alta de turno: la crea NuevoTurnoModal contra POST /api/turnos.
  // Acá sólo refrescamos la tabla con el turno que devolvió el back (201).
  // ==========================================

  const [turnosNuevos, setTurnosNuevos] = useState<Turno[]>([]);

  const agregarTurno = (nuevoTurno: Turno) => {
    setTurnosNuevos((prev) => [...prev, nuevoTurno]);
  };

  const actualizarTurno = (turno: Turno) => {
    setActualizados((prev) => ({ ...prev, [turno.id]: turno }));
  };

  const turnosFiltrados = [
    ...turnosOrdenados,
    ...turnosNuevos.map((t) => actualizados[t.id] ?? t),
  ].sort(
    (a, b) => a.fechaHora.localeCompare(b.fechaHora)
  );

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

          total={totalTurnos}

          pendientes={pendientes}

          confirmados={confirmados}

          cancelados={cancelados}

        />


        <TurnosTable

          turnos={turnosFiltrados}

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
