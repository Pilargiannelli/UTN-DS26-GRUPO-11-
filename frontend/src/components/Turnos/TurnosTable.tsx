import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Tab,
  Table,
  Tabs,
  Form,
} from "react-bootstrap";

import type { TurnosTableProps } from "../../types/TurnosTableProps";
import type { EstadoTurno, Turno } from "../../types/Turno";
import { formatearHora } from "../../utils/fecha";
import { useAuth } from "../../hooks/useAuth";
import { apiFetch } from "../../services/api";

import "../../assets/styles/TurnosTable.css";
import TurnosFilters from "./TurnosFilters";
import { Calendar3, CalendarPlus, Search } from "react-bootstrap-icons";

type Seccion = "pendientes" | "confirmados" | "cancelados";

// Cada pestaña junta los estados que se manejan igual. Reprogramado espera
// confirmación como un Pendiente.
const ESTADOS_POR_SECCION: Record<Seccion, EstadoTurno[]> = {
  pendientes: ["Pendiente", "Reprogramado"],
  confirmados: ["Confirmado"],
  cancelados: ["Cancelado"],
};

// Ilustración de las listas vacías (solo presentación)
const CalendarioVacio = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 220 140" aria-hidden="true">
    <path d="M32 80C21 41 62 17 94 29C128 3 176 26 177 61C217 65 220 111 186 119C161 136 140 117 116 123C78 139 62 112 38 118C5 121 4 86 32 80Z" fill="#e6ece2" />
    <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="73" y="42" width="77" height="73" rx="10" fill="#fffefa" /><path d="M74 63H149M92 34V48M130 34V48M113 91L122 99L138 82M178 52L187 42M182 65L196 61" />
    </g>
  </svg>
);

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
  turnos, onNuevoTurno, onTurnoActualizado, recepcion = false
}: TurnosTableProps) {
  const { tieneRol } = useAuth();
  const [procesando, setProcesando] = useState<number | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [seccion, setSeccion] = useState<Seccion>("pendientes");

  const [busqueda, setBusqueda] = useState("");
  const [fechaFiltro, setFechaFiltro] = useState("todas");
  const [fechaElegida, setFechaElegida] = useState("");
  const normalizar = (texto: string) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-AR").trim();
  const textoBuscado = normalizar(busqueda);
  const diaFiltro = new Date();
  if (fechaFiltro === "manana") diaFiltro.setDate(diaFiltro.getDate() + 1);
  const fechaBuscada = fechaFiltro === "elegir" ? fechaElegida : claveDia(diaFiltro.toISOString());
  const turnosVisibles = recepcion ? turnos.filter(turno => {
    const coincideTexto = normalizar(`${nombreCompleto(turno.paciente.usuario)} ${nombreCompleto(turno.medico.usuario)}`).includes(textoBuscado);
    return coincideTexto && (fechaFiltro === "todas" || !fechaBuscada || claveDia(turno.fechaHora) === fechaBuscada);
  }) : turnos;
  const hayFiltros = textoBuscado !== "" || fechaFiltro !== "todas";

  const puedeCrear = tieneRol("SECRETARIA") || tieneRol("MEDICO");
  // El médico solo ve su agenda: la columna "Médico" sería siempre él
  const mostrarMedico = !tieneRol("MEDICO");

  const turnosDe = (s: Seccion) => turnosVisibles.filter((t) => ESTADOS_POR_SECCION[s].includes(t.estado));

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
      return recepcion ? (
        <div className="recepcion-vacio">
          <CalendarioVacio className="recepcion-calendario" />
          <div>
            <h3>{hayFiltros ? "Sin coincidencias" : s === "pendientes" ? "Todo al día" : "Sin turnos en este estado"}</h3>
            <p>{hayFiltros ? "No hay turnos que coincidan con la búsqueda y la fecha seleccionadas." : VACIO[s]}</p>
          </div>
          {hayFiltros && <Button variant="outline-success" onClick={() => { setBusqueda(""); setFechaFiltro("todas"); setFechaElegida(""); }}>Limpiar filtros</Button>}
        </div>
      ) : (
        <div className="agenda-vacio">
          <CalendarioVacio className="agenda-vacio-ilustracion" />
          <p className="agenda-vacia">{VACIO[s]}</p>
        </div>
      );
    }

    const porDia = lista.reduce<Record<string, Turno[]>>((grupos, t) => {
      (grupos[claveDia(t.fechaHora)] ??= []).push(t);
      return grupos;
    }, {});

    return (
      <Table responsive={!recepcion} className="agenda-table align-middle mb-0">
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
                <td className="hora" data-label="Hora">{formatearHora(turno.fechaHora)}</td>
                <td data-label="Paciente">
                  {/* El nombre lleva a la ficha del paciente (datos, turnos e historia) */}
                  <Link to={`/pacientes/${turno.pacienteId}`} className="agenda-paciente">
                    {nombreCompleto(turno.paciente.usuario)}
                  </Link>
                  {turno.estado === "Reprogramado" && <span className="agenda-etiqueta">Reprogramado</span>}
                </td>
                {mostrarMedico && (
                  <td data-label="Médico">
                    {nombreCompleto(turno.medico.usuario)}
                    <span className="agenda-especialidad">{turno.medico.especialidad}</span>
                  </td>
                )}
                {conAcciones && (
                  <td data-label="Acciones">
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
          <div className="agenda-header-titulo">
            <span className="agenda-header-icono" aria-hidden="true">{recepcion ? <CalendarPlus /> : <Calendar3 />}</span>
            <div>
              <h2>{recepcion ? "Gestión de turnos" : "Próximos turnos"}</h2>
              <p>{recepcion ? "Revisá las solicitudes pendientes y organizá las próximas atenciones." : "Los turnos que ya pasaron se consultan en la Agenda."}</p>
            </div>
          </div>
          {recepcion ? (
            <div className="recepcion-filtros" role="search" aria-label="Filtrar turnos">
              <div className="recepcion-busqueda">
                <Search aria-hidden="true" />
                <Form.Control type="search" aria-label="Buscar paciente o profesional" placeholder="Buscar paciente o profesional…" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
              </div>
              <Form.Select aria-label="Filtrar por fecha" value={fechaFiltro} onChange={e => setFechaFiltro(e.target.value)}>
                <option value="todas">Todas las fechas</option><option value="hoy">Hoy</option><option value="manana">Mañana</option><option value="elegir">Elegir fecha</option>
              </Form.Select>
              {fechaFiltro === "elegir" && <Form.Control type="date" aria-label="Fecha del turno" value={fechaElegida} onChange={e => setFechaElegida(e.target.value)} />}
            </div>
          ) : puedeCrear && <TurnosFilters onNuevoTurno={onNuevoTurno} />}
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
