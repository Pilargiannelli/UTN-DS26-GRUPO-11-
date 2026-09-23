import {
  Badge,
  Button,
  Card,
  Table,
} from "react-bootstrap";

import {
  PencilSquare,
  CalendarEvent,
  Trash,
} from "react-bootstrap-icons";

import type { TurnosTableProps } from "../../types/TurnosTableProps";
import { formatearHora, formatearChipFecha } from "../../utils/fecha";
import { useAuth } from "../../hooks/useAuth";

import "../../assets/styles/TurnosTable.css";
import TurnosFilters from "./TurnosFilters";

function obtenerColorEstado(estado: string) {
  switch (estado) {
    case "Pendiente":
      return "warning";

    case "Confirmado":
      return "success";

    case "Cancelado":
      return "danger";

    default:
      return "secondary";
  }
}

function obtenerIniciales(nombre: string) {
  return nombre
    .split(" ")
    .map((p) => p[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function TurnosTable({
  turnos, onNuevoTurno
}: TurnosTableProps) {
  const { tieneRol } = useAuth();

  // Muestra filtros y creación de turno solo para roles administrativos o médicos
  const puedeCrearOFiltrar = tieneRol("SECRETARIA") || tieneRol("MEDICO");
  const puedeEditarOReprogramar = tieneRol("SECRETARIA") || tieneRol("MEDICO");

  return (
    <Card className="agenda-card">
      <Card.Body>
        <div className="agenda-header">
          <div>
            <h2>Agenda Médica</h2>
            <p>Turnos programados para hoy</p>
          </div>
          {puedeCrearOFiltrar && <TurnosFilters onNuevoTurno={onNuevoTurno} />}
        </div>

        <Table
          responsive
          hover
          className="agenda-table align-middle"
        >
          <thead>
            <tr>
              <th>Hora</th>
              <th>Paciente</th>
              <th>Médico</th>
              <th>Especialidad</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {turnos.map((turno) => {
              const nombrePaciente = `${turno.paciente.usuario.nombre} ${turno.paciente.usuario.apellido}`;
              const nombreMedico = `${turno.medico.usuario.nombre} ${turno.medico.usuario.apellido}`;
              const { dia, mes } = formatearChipFecha(turno.fechaHora);

              return (
                <tr key={turno.id}>
                  <td>
                    <span className="hora">
                      {formatearHora(turno.fechaHora)}
                    </span>
                  </td>

                  <td>
                    <div className="paciente">
                      <div className="avatar">
                        {obtenerIniciales(nombrePaciente)}
                      </div>
                      <div>
                        <strong>{nombrePaciente}</strong>
                      </div>
                    </div>
                  </td>

                  <td>{nombreMedico}</td>

                  <td>
                    <span className="texto-gris">
                      {turno.medico.especialidad}
                    </span>
                  </td>

                  <td>
                    {dia} {mes}
                  </td>

                  <td>
                    <Badge bg={obtenerColorEstado(turno.estado)}>
                      {turno.estado}
                    </Badge>
                  </td>

                  <td>
                    <div className="acciones d-flex gap-1 justify-content-center">
                      {/* Reprogramar/Editar restringidos para PACIENTE según matriz */}
                      {puedeEditarOReprogramar && (
                        <>
                          <Button variant="light" title="Editar">
                            <PencilSquare />
                          </Button>
                          <Button variant="light" title="Reprogramar">
                            <CalendarEvent />
                          </Button>
                        </>
                      )}

                      {/* Cancelar permitido para titular o personal */}
                      <Button variant="light" title="Cancelar">
                        <Trash />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

export default TurnosTable;