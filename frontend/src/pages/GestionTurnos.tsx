import { Container } from "react-bootstrap";
import { useState } from "react";

import Layout from "../components/Layout/Layout";
import HeroTurnos from "../components/Turnos/HeroTurnos";
import DashboardCards from "../components/Turnos/DashboardCards";
import TurnosFilters from "../components/Turnos/TurnosFilters";
import TurnosTable from "../components/Turnos/TurnosTable";
import NuevoTurnoModal from "../components/Turnos/NuevoTurnoModal";

import type { Turno } from "../types/Turno";

function GestionTurnos() {

  const [showModal, setShowModal] = useState(false);

  const [turnos, setTurnos] = useState<Turno[]>([
    {
      id: 1,
      paciente: "Juan Pérez",
      medico: "Dr. Font",
      especialidad: "Traumatología",
      fecha: "2026-07-03",
      hora: "09:00",
      obraSocial: "OSDE",
      estado: "Pendiente",
    },
    {
      id: 2,
      paciente: "Ana López",
      medico: "Dr. Castelli",
      especialidad: "Cardiología",
      fecha: "2026-07-03",
      hora: "09:30",
      obraSocial: "IOMA",
      estado: "Confirmado",
    },
    {
      id: 3,
      paciente: "Carlos Ruiz",
      medico: "Dr. Messi",
      especialidad: "Clínica Médica",
      fecha: "2026-07-03",
      hora: "10:00",
      obraSocial: "PAMI",
      estado: "Cancelado",
    },
  ]);

  const agregarTurno = (nuevoTurno: Turno) => {
    setTurnos((prev) => [...prev, nuevoTurno]);
  };

  return (
    <Layout>

      <Container className="mt-4">

        <HeroTurnos
          secretaria="Pilar"
          proximoPaciente="Juan Pérez"
          especialidad="Traumatología"
          fecha="Viernes 3 Julio"
          hora="09:00"
        />

        <DashboardCards />

        <TurnosFilters
          onNuevoTurno={() => setShowModal(true)}
        />

        <TurnosTable
          turnos={turnos}
        />

                <NuevoTurnoModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onAgregar={agregarTurno}
        />

      </Container>

    </Layout>
  );
}

export default GestionTurnos;