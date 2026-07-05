import { useState, useEffect } from "react";
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
    usuario?.rol === "medico"
      ? `Dr. ${usuario.docs.apellido}`
      : usuario?.docs.nombre ?? "Secretaría";

  const {
    data,
    loading,
    error,
  } = useFetch<Turno[]>("/turnos.json");

  const [turnos, setTurnos] = useState<Turno[]>([]);

  useEffect(() => {

    if (data) {

      const ordenados = [...data].sort((a, b) => {

        if (a.fecha !== b.fecha) {

          return a.fecha.localeCompare(b.fecha);

        }

        return a.hora.localeCompare(b.hora);

      });

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTurnos(ordenados);

    }

  }, [data]);

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

  const proximoTurno = turnos.find(
    turno => turno.estado !== "Cancelado"
  );

  // ==========================================
  // Dashboard
  // ==========================================

  const turnosFiltrados = usuario?.rol === "medico" ? turnos.filter( turno => turno.medico === `Dr. ${usuario.docs.apellido}` ) : turnos;

  const totalTurnos = turnosFiltrados.length;

  const pendientes =
    turnosFiltrados.filter(
      t => t.estado === "Pendiente"
    ).length;

  const confirmados =
    turnosFiltrados.filter(
      t => t.estado === "Confirmado"
    ).length;

  const cancelados =
    turnosFiltrados.filter(
      t => t.estado === "Cancelado"
    ).length;

  // ==========================================
  // Alta de turno
  // ==========================================

  const agregarTurno = (
    nuevoTurno: Turno
  ) => {

    const medicoOcupado = turnos.some(
      turno =>
        turno.medico === nuevoTurno.medico &&
        turno.fecha === nuevoTurno.fecha &&
        turno.hora === nuevoTurno.hora
    );

    if (medicoOcupado) {

      alert(
        "Ese médico ya posee un turno asignado en esa fecha y horario."
      );

      return;

    }

    const pacienteOcupado = turnos.some(
      turno =>
        turno.paciente === nuevoTurno.paciente &&
        turno.fecha === nuevoTurno.fecha &&
        turno.hora === nuevoTurno.hora
    );

    if (pacienteOcupado) {

      alert(
        "El paciente ya posee un turno asignado en esa fecha y horario."
      );

      return;

    }

    const nuevosTurnos = [

      ...turnos,

      nuevoTurno,

    ].sort((a, b) => {

      if (a.fecha !== b.fecha) {

        return a.fecha.localeCompare(b.fecha);

      }

      return a.hora.localeCompare(b.hora);

    });

    setTurnos(nuevosTurnos);

  };

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
              ? proximoTurno.paciente
              : "Sin turnos"
          }

          especialidad={
            proximoTurno
              ? proximoTurno.especialidad
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