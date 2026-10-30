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
import { formatearHora } from "../../utils/fecha";
import { useAuth } from "../../hooks/useAuth";
import { apiFetch } from "../../services/api";
import { yaPaso } from "../../utils/estadoTurno";

import "../../assets/styles/TurnosTable.css";
import TurnosFilters from "./TurnosFilters";

function obtenerColorEstado(estado: string) {
  switch (estado) {
    case "Pendiente":
    case "Reprogramado":
      return "warning";

    case "Confirmado":
      return "success";

    default:
      return "secondary";
  }
}

// Clave del día en hora local (YYYY-MM-DD), para agrupar
const claveDia = (fechaHora: string) => new Date(fechaHora).toLocaleDateString("en-CA");

// "Hoy · jueves 29 de octubre", "Mañana · ..." o "viernes 30 de octubre"
function tituloDia(clave: string) {
  const fecha = new Date(`${clave}T00:00:00`);
  const texto = fecha.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const diferencia = Math.round((fecha.getTime() - hoy.getTime()) / (24 * 60 * 60 * 1000));
  if (diferencia === 0) return `Hoy · ${texto}`;
  if (diferencia === 1) return `Mañana · ${texto}`;
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const nombreCompleto = (u: { nombre: string; apellido: string }) => `${u.nombre} ${u.apellido}`;

function TurnosTable({
  turnos, onNuevoTurno, onTurnoActualizado, verAnteriores, onToggleAnteriores
}: TurnosTableProps) {
  const { tieneRol } = useAuth();
  const [procesando, setProcesando] = useState<number | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  // Muestra filtros y creación de turno solo para roles administrativos o médicos
  const puedeCrearOFiltrar = tieneRol("SECRETARIA") || tieneRol("MEDICO");
  // El médico solo ve su agenda: la columna "Médico" sería siempre él
  const mostrarMedico = !tieneRol("MEDICO");
  const columnas = mostrarMedico ? 5 : 4;

  // Los activos se agrupan por día; los cancelados van aparte, abajo
  const activos = turnos.filter((t) => t.estado !== "Cancelado");
  const cancelados = turnos.filter((t) => t.estado === "Cancelado");
  const porDia = activos.reduce<Record<string, Turno[]>>((grupos, t) => {
    (grupos[claveDia(t.fechaHora)] ??= []).push(t);
    return grupos;
  }, {});

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
            <h2>Agenda</h2>
            <p>
              {verAnteriores ? "Todos los turnos" : "De hoy en adelante"}
              {" · "}
              <Button variant="link" size="sm" className="p-0 align-baseline" onClick={onToggleAnteriores}>
                {verAnteriores ? "Ocultar anteriores" : "Ver anteriores"}
              </Button>
            </p>
          </div>
          {puedeCrearOFiltrar && <TurnosFilters onNuevoTurno={onNuevoTurno} />}
        </div>

        {errorAccion && (
          <Alert variant="danger" dismissible onClose={() => setErrorAccion(null)}>
            {errorAccion}
          </Alert>
        )}

        <Table responsive className="agenda-table align-middle">
          <thead>
            <tr>
              <th scope="col">Hora</th>
              <th scope="col">Paciente</th>
              {mostrarMedico && <th scope="col">Médico</th>}
              <th scope="col">Estado</th>
              <th scope="col" className="text-end">Acciones</th>
            </tr>
          </thead>

          {activos.length === 0 && (
            <tbody>
              <tr>
                <td colSpan={columnas} className="text-center texto-gris py-4">
                  {verAnteriores ? "No hay turnos activos." : "No hay turnos de hoy en adelante."}
                </td>
              </tr>
            </tbody>
          )}

          {/* Un <tbody> por día, con el día como título */}
          {Object.entries(porDia).map(([dia, turnosDelDia]) => (
            <tbody key={dia}>
              <tr className="agenda-dia">
                <th colSpan={columnas} scope="colgroup">{tituloDia(dia)}</th>
              </tr>
              {turnosDelDia.map((turno) => {
                const pasado = yaPaso(turno.fechaHora);
                return (
                  <tr key={turno.id} className={pasado ? "agenda-fila-pasada" : undefined}>
                    <td className="hora">{formatearHora(turno.fechaHora)}</td>
                    <td><strong>{nombreCompleto(turno.paciente.usuario)}</strong></td>
                    {mostrarMedico && (
                      <td>
                        {nombreCompleto(turno.medico.usuario)}
                        <span className="agenda-especialidad">{turno.medico.especialidad}</span>
                      </td>
                    )}
                    <td>
                      <Badge bg={obtenerColorEstado(turno.estado)}>{turno.estado}</Badge>
                    </td>
                    <td>
                      <div className="acciones d-flex gap-2 justify-content-end">
                        {pasado ? (
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
                            <Button
                              size="sm"
                              variant="outline-danger"
                              disabled={procesando === turno.id}
                              onClick={() => ejecutarAccion(turno, "cancelar")}
                            >
                              Cancelar
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          ))}
        </Table>

        {/* Cancelados: aparte y cerrados, para no mezclarlos con la agenda */}
        {cancelados.length > 0 && (
          <details className="agenda-cancelados">
            <summary>Cancelados ({cancelados.length})</summary>
            <Table responsive size="sm" className="mb-0">
              <thead>
                <tr>
                  <th scope="col">Fecha y hora</th>
                  <th scope="col">Paciente</th>
                  {mostrarMedico && <th scope="col">Médico</th>}
                </tr>
              </thead>
              <tbody>
                {cancelados.map((turno) => (
                  <tr key={turno.id}>
                    <td>
                      {new Date(turno.fechaHora).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })}
                      {" · "}
                      {formatearHora(turno.fechaHora)}
                    </td>
                    <td>{nombreCompleto(turno.paciente.usuario)}</td>
                    {mostrarMedico && <td>{nombreCompleto(turno.medico.usuario)}</td>}
                  </tr>
                ))}
              </tbody>
            </Table>
          </details>
        )}
      </Card.Body>
    </Card>
  );
}

export default TurnosTable;
