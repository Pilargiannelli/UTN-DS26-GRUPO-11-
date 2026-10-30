import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Tab,
  Table,
  Tabs,
} from "react-bootstrap";

import type { TurnosTableProps } from "../../types/TurnosTableProps";
import type { EstadoTurno, Turno } from "../../types/Turno";
import { formatearHora } from "../../utils/fecha";
import { useAuth } from "../../hooks/useAuth";
import { apiFetch } from "../../services/api";

import "../../assets/styles/TurnosTable.css";
import TurnosFilters from "./TurnosFilters";

type Seccion = "pendientes" | "confirmados" | "cancelados";

// Cada pestaña junta los estados que se manejan igual. Reprogramado espera
// confirmación como un Pendiente.
const ESTADOS_POR_SECCION: Record<Seccion, EstadoTurno[]> = {
  pendientes: ["Pendiente", "Reprogramado"],
  confirmados: ["Confirmado"],
  cancelados: ["Cancelado"],
};

const VACIO: Record<Seccion, string> = {
  pendientes: "No hay turnos pendientes de confirmar.",
  confirmados: "No hay turnos confirmados próximos.",
  cancelados: "No hay turnos cancelados próximos.",
};

// Clave del día en hora local (YYYY-MM-DD), para agrupar
const claveDia = (fechaHora: string) => new Date(fechaHora).toLocaleDateString("en-CA");

// "Hoy · jueves 29 de octubre", "Mañana · ..." o "Viernes 30 de octubre"
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
  turnos, onNuevoTurno, onTurnoActualizado
}: TurnosTableProps) {
  const { tieneRol } = useAuth();
  const [procesando, setProcesando] = useState<number | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [seccion, setSeccion] = useState<Seccion>("pendientes");

  const puedeCrear = tieneRol("SECRETARIA") || tieneRol("MEDICO");
  // El médico solo ve su agenda: la columna "Médico" sería siempre él
  const mostrarMedico = !tieneRol("MEDICO");

  const turnosDe = (s: Seccion) => turnos.filter((t) => ESTADOS_POR_SECCION[s].includes(t.estado));

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

  // Lista de una pestaña: un <tbody> por día, con el día como título
  const renderLista = (s: Seccion) => {
    const lista = turnosDe(s);
    const conAcciones = s !== "cancelados";
    const columnas = 2 + (mostrarMedico ? 1 : 0) + (conAcciones ? 1 : 0);

    if (lista.length === 0) {
      return <p className="agenda-vacia">{VACIO[s]}</p>;
    }

    const porDia = lista.reduce<Record<string, Turno[]>>((grupos, t) => {
      (grupos[claveDia(t.fechaHora)] ??= []).push(t);
      return grupos;
    }, {});

    return (
      <Table responsive className="agenda-table align-middle mb-0">
        <thead>
          <tr>
            <th scope="col">Hora</th>
            <th scope="col">Paciente</th>
            {mostrarMedico && <th scope="col">Médico</th>}
            {conAcciones && <th scope="col" className="text-end">Acciones</th>}
          </tr>
        </thead>
        {Object.entries(porDia).map(([dia, turnosDelDia]) => (
          <tbody key={dia}>
            <tr className="agenda-dia">
              <th colSpan={columnas} scope="colgroup">{tituloDia(dia)}</th>
            </tr>
            {turnosDelDia.map((turno) => (
              <tr key={turno.id}>
                <td className="hora">{formatearHora(turno.fechaHora)}</td>
                <td>
                  <span className="agenda-paciente">{nombreCompleto(turno.paciente.usuario)}</span>
                  {turno.estado === "Reprogramado" && <span className="agenda-etiqueta">Reprogramado</span>}
                </td>
                {mostrarMedico && (
                  <td>
                    {nombreCompleto(turno.medico.usuario)}
                    <span className="agenda-especialidad">{turno.medico.especialidad}</span>
                  </td>
                )}
                {conAcciones && (
                  <td>
                    <div className="acciones d-flex gap-2 justify-content-end">
                      {s === "pendientes" && (
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
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        ))}
      </Table>
    );
  };

  const titulo = (texto: string, s: Seccion) => (
    <>
      {texto} <span className={`agenda-contador agenda-contador-${s}`}>{turnosDe(s).length}</span>
    </>
  );

  return (
    <Card className="agenda-card">
      <Card.Body>
        <div className="agenda-header">
          <div>
            <h2>Próximos turnos</h2>
            <p>Los turnos que ya pasaron se consultan en la Agenda.</p>
          </div>
          {puedeCrear && <TurnosFilters onNuevoTurno={onNuevoTurno} />}
        </div>

        {errorAccion && (
          <Alert variant="danger" dismissible onClose={() => setErrorAccion(null)}>
            {errorAccion}
          </Alert>
        )}

        {/* Una pestaña por estado: se ve una lista por vez */}
        <Tabs
          activeKey={seccion}
          onSelect={(k) => k && setSeccion(k as Seccion)}
          className="agenda-tabs"
          id="agenda-secciones"
          mountOnEnter
          unmountOnExit
          transition={false}
        >
          <Tab eventKey="pendientes" title={titulo("Pendientes", "pendientes")}>
            {renderLista("pendientes")}
          </Tab>
          <Tab eventKey="confirmados" title={titulo("Confirmados", "confirmados")}>
            {renderLista("confirmados")}
          </Tab>
          <Tab eventKey="cancelados" title={titulo("Cancelados", "cancelados")}>
            {renderLista("cancelados")}
          </Tab>
        </Tabs>
      </Card.Body>
    </Card>
  );
}

export default TurnosTable;
