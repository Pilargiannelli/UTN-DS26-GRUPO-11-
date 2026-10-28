import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Table,
} from "react-bootstrap";

import type { TurnosTableProps } from "../../types/TurnosTableProps";
import type { Turno } from "../../types/Turno";
import { formatearHora, formatearChipFecha } from "../../utils/fecha";
import { useAuth } from "../../hooks/useAuth";
import { apiFetch } from "../../services/api";
import { yaPaso } from "../../utils/estadoTurno";

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
  turnos, onNuevoTurno, onTurnoActualizado, verAnteriores, onToggleAnteriores
}: TurnosTableProps) {
  const { tieneRol } = useAuth();
  const [procesando, setProcesando] = useState<number | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  // Muestra filtros y creación de turno solo para roles administrativos o médicos
  const puedeCrearOFiltrar = tieneRol("SECRETARIA") || tieneRol("MEDICO");

  // Confirmar: PUT con el estado nuevo. Cancelar: PATCH /cancelar (cambio de
  // estado, el turno no se borra). El back verifica que el médico sea el dueño.
  const ejecutarAccion = async (turno: Turno, accion: "confirmar" | "cancelar") => {
    setProcesando(turno.id);
    setErrorAccion(null);
    try {
      const actualizado = accion === "confirmar"
        ? await apiFetch<Turno>(`/turnos/${turno.id}`, { method: "PUT", body: JSON.stringify({ estado: "Confirmado" }) })
        : await apiFetch<Turno>(`/turnos/${turno.id}/cancelar`, { method: "PATCH" });
      onTurnoActualizado(actualizado);
    } catch (err) {
      setErrorAccion(err instanceof Error ? err.message : "No se pudo actualizar el turno");
    } finally {
      setProcesando(null);
    }
  };

  return (
    <Card className="agenda-card">
      <Card.Body>
        <div className="agenda-header">
          <div>
            <h2>Agenda Médica</h2>
            <p>{verAnteriores ? "Todos los turnos" : "Turnos de hoy en adelante"}</p>
            <Button variant="link" size="sm" className="p-0" onClick={onToggleAnteriores}>
              {verAnteriores ? "Ocultar anteriores" : "Ver anteriores"}
            </Button>
          </div>
          {puedeCrearOFiltrar && <TurnosFilters onNuevoTurno={onNuevoTurno} />}
        </div>

        {errorAccion && (
          <Alert variant="danger" dismissible onClose={() => setErrorAccion(null)}>
            {errorAccion}
          </Alert>
        )}

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
            {turnos.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center texto-gris py-4">
                  {verAnteriores ? "No hay turnos registrados." : "No hay turnos de hoy en adelante."}
                </td>
              </tr>
            )}
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
                      {yaPaso(turno.fechaHora) ? (
                        // Un turno pasado ya no se confirma ni se cancela
                        <span className="texto-gris small">Ya pasó</span>
                      ) : (
                      <>
                      {(turno.estado === "Pendiente" || turno.estado === "Reprogramado") && (
                        <Button
                          size="sm"
                          variant="success"
                          disabled={procesando === turno.id}
                          onClick={() => ejecutarAccion(turno, "confirmar")}
                        >
                          Confirmar
                        </Button>
                      )}
                      {turno.estado !== "Cancelado" ? (
                        <Button
                          size="sm"
                          variant="outline-danger"
                          disabled={procesando === turno.id}
                          onClick={() => ejecutarAccion(turno, "cancelar")}
                        >
                          Cancelar
                        </Button>
                      ) : (
                        <span className="texto-gris small">Horario liberado</span>
                      )}
                      </>
                      )}
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