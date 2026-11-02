import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, Badge, Button, Container, Form, Spinner } from "react-bootstrap";
import Layout from "../components/Layout/Layout.tsx";
import { BotonVolver } from "../components/BotonVolver.tsx";
import { BuscadorSelect, type OpcionBuscador } from "../components/Turnos/BuscadorSelect.tsx";
import { Paginador } from "../components/Medico/Paginador.tsx";
import { COLOR_ESTADO } from "../utils/estadoTurno.ts";
import { useFetch } from "../hooks/useFetch.ts";
import { formatearHora } from "../utils/fecha.ts";
import { enRango, rangoDePeriodo } from "../utils/periodos.ts";
import type { EstadoTurno, Turno } from "../types/Turno.ts";
import "../assets/styles/ListadoPaciente.css";

const FILAS_POR_PAGINA = 8;
type FiltroFecha = "todas" | "proximos" | "anteriores" | "semana" | "mes" | "anio" | "dia" | "rango";

const FECHAS: { valor: FiltroFecha; etiqueta: string }[] = [
  { valor: "todas", etiqueta: "Todas las fechas" },
  { valor: "proximos", etiqueta: "Próximos" },
  { valor: "anteriores", etiqueta: "Anteriores" },
  { valor: "semana", etiqueta: "Última semana" },
  { valor: "mes", etiqueta: "Último mes" },
  { valor: "anio", etiqueta: "Último año" },
  { valor: "dia", etiqueta: "Un día en particular" },
  { valor: "rango", etiqueta: "Entre dos fechas" },
];
const ESTADOS: EstadoTurno[] = ["Pendiente", "Confirmado", "Reprogramado", "Cancelado"];

interface MedicoBasico {
  id: number;
  especialidad: string;
  usuario: { nombre: string; apellido: string };
}

interface PacienteBasico {
  usuario: { nombre: string; apellido: string };
}

const FECHA_TURNO = new Intl.DateTimeFormat("es-AR", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });

// /pacientes/:id/turnos: todos los turnos del paciente con este médico. GET /api/turnos devuelve
// solo la agenda del médico (matriz de permisos §8): los turnos con otros médicos no se ven.
function TurnosPaciente() {
  const { id } = useParams();
  const pacienteId = Number(id);
  const { data: turnos, loading, error } = useFetch<Turno[]>("/turnos");
  const { data: paciente } = useFetch<PacienteBasico>(`/pacientes/${id}`);
  const { data: medicos } = useFetch<MedicoBasico[]>("/medicos");

  const [medicoId, setMedicoId] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [estado, setEstado] = useState<"todos" | EstadoTurno>("todos");
  const [fecha, setFecha] = useState<FiltroFecha>("todas");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [pagina, setPagina] = useState(1);

  const hayFiltros = medicoId !== "" || especialidad !== "" || estado !== "todos" || fecha !== "todas";

  const delPaciente = useMemo(() => (turnos ?? []).filter((t) => t.pacienteId === pacienteId), [turnos, pacienteId]);

  // Médicos y especialidades de todo el consultorio (aunque no hayan atendido a este paciente)
  const especialidades = useMemo(() => [...new Set((medicos ?? []).map((m) => m.especialidad))].sort((a, b) => a.localeCompare(b, "es")), [medicos]);

  // Los médicos se ofrecen según la especialidad elegida
  const opcionesMedico = useMemo<OpcionBuscador[]>(
    () =>
      (medicos ?? [])
        .filter((m) => especialidad === "" || m.especialidad === especialidad)
        .map((m) => ({ value: String(m.id), etiqueta: `${m.usuario.nombre} ${m.usuario.apellido}`, detalle: m.especialidad }))
        .sort((a, b) => a.etiqueta.localeCompare(b.etiqueta, "es")),
    [medicos, especialidad]
  );

  const filtrados = useMemo(() => {
    const rango =
      fecha === "dia" ? rangoDePeriodo("personalizado", desde, desde)
      : fecha === "rango" ? rangoDePeriodo("personalizado", desde, hasta)
      : rangoDePeriodo(fecha === "todas" ? "todo" : fecha);
    // Siempre del más reciente al más antiguo
    return delPaciente
      .filter((t) =>
        enRango(t.fechaHora, rango) &&
        (estado === "todos" || t.estado === estado) &&
        (medicoId === "" || String(t.medicoId) === medicoId) &&
        (especialidad === "" || t.medico.especialidad === especialidad))
      .sort((a, b) => b.fechaHora.localeCompare(a.fechaHora));
  }, [delPaciente, fecha, desde, hasta, estado, medicoId, especialidad]);

  const elegirMedico = (id: string) => {
    setMedicoId(id);
    setPagina(1);
    // Al elegir un médico se completa su especialidad y queda fija hasta quitarlo
    const elegido = (medicos ?? []).find((m) => String(m.id) === id);
    if (elegido) setEspecialidad(elegido.especialidad);
  };

  const elegirEspecialidad = (valor: string) => {
    setEspecialidad(valor);
    setPagina(1);
  };

  const cambiar = <T,>(poner: (valor: T) => void) => (valor: T) => {
    poner(valor);
    setPagina(1);
  };

  const limpiar = () => {
    setMedicoId("");
    setEspecialidad("");
    setEstado("todos");
    setFecha("todas");
    setDesde("");
    setHasta("");
    setPagina(1);
  };

  const paginas = Math.max(1, Math.ceil(filtrados.length / FILAS_POR_PAGINA));
  const paginaActual = Math.min(pagina, paginas);
  const visibles = filtrados.slice((paginaActual - 1) * FILAS_POR_PAGINA, paginaActual * FILAS_POR_PAGINA);
  const nombre = paciente ? `${paciente.usuario.nombre} ${paciente.usuario.apellido}` : "";
  const ahora = new Date();

  return (
    <Layout>
      <Container className="listado-paciente">
        <BotonVolver destino={`/pacientes/${id}`} />

        <header className="listado-encabezado">
          <div>
            <h1 className="listado-titulo">Turnos del paciente</h1>
            <p className="listado-subtitulo">
              {nombre ? <>{nombre} · {delPaciente.length} turnos con vos</> : "Cargando…"}
            </p>
          </div>
        </header>

        {loading && <div className="text-center py-5"><Spinner animation="border" role="status" aria-label="Cargando turnos" /></div>}
        {error && <Alert variant="danger">{error.message}</Alert>}

        {turnos && (
          <section className="listado-tarjeta">
            <div className="listado-filtros-fila listado-filtros-turnos">
              <div className="listado-filtro-medico">
                <BuscadorSelect
                  opciones={opcionesMedico}
                  value={medicoId}
                  onChange={elegirMedico}
                  placeholder="Buscar médico"
                  ariaLabel="Médico"
                />
              </div>
              <Form.Select aria-label="Especialidad" value={especialidad} disabled={medicoId !== ""} onChange={(e) => elegirEspecialidad(e.target.value)}>
                <option value="">Todas las especialidades</option>
                {especialidades.map((e) => <option key={e} value={e}>{e}</option>)}
              </Form.Select>
              <Form.Select aria-label="Estado" value={estado} onChange={(e) => cambiar(setEstado)(e.target.value as "todos" | EstadoTurno)}>
                <option value="todos">Todos los estados</option>
                {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
              </Form.Select>
              <Form.Select aria-label="Fecha" value={fecha} onChange={(e) => cambiar(setFecha)(e.target.value as FiltroFecha)}>
                {FECHAS.map((f) => <option key={f.valor} value={f.valor}>{f.etiqueta}</option>)}
              </Form.Select>
              {(fecha === "dia" || fecha === "rango") && (
                <Form.Group controlId="filtro-desde" className="listado-fecha-campo">
                  <Form.Label>{fecha === "dia" ? "Día" : "Desde"}</Form.Label>
                  <Form.Control type="date" value={desde} max={fecha === "rango" ? hasta || undefined : undefined} onChange={(e) => cambiar(setDesde)(e.target.value)} />
                </Form.Group>
              )}
              {fecha === "rango" && (
                <Form.Group controlId="filtro-hasta" className="listado-fecha-campo">
                  <Form.Label>Hasta</Form.Label>
                  <Form.Control type="date" value={hasta} min={desde || undefined} onChange={(e) => cambiar(setHasta)(e.target.value)} />
                </Form.Group>
              )}
              {hayFiltros && <Button variant="link" className="listado-limpiar" onClick={limpiar}>Limpiar filtros</Button>}
            </div>

            {filtrados.length === 0 ? (
              <p className="listado-vacio">
                {delPaciente.length === 0 ? "Todavía no tiene turnos con vos." : "No hay turnos que coincidan con los filtros."}
              </p>
            ) : (
              <div className="listado-tabla-contenedor listado-tabla-fija">
                <table className="listado-tabla">
                  <thead>
                    <tr>
                      <th scope="col">Fecha</th>
                      <th scope="col">Hora</th>
                      <th scope="col">Especialidad</th>
                      <th scope="col">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibles.map((t) => {
                      const pasado = new Date(t.fechaHora) < ahora;
                      return (
                        <tr key={t.id}>
                          <td className="listado-fecha">{FECHA_TURNO.format(new Date(t.fechaHora))}</td>
                          <td>{formatearHora(t.fechaHora)} hs</td>
                          <td>{t.medico.especialidad}</td>
                          <td>
                            <Badge bg={COLOR_ESTADO[t.estado] ?? "secondary"}>
                              {pasado && t.estado !== "Cancelado" ? "Realizado" : t.estado}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <Paginador pagina={paginaActual} tamanio={FILAS_POR_PAGINA} total={filtrados.length} onCambiar={setPagina} />
          </section>
        )}
      </Container>
    </Layout>
  );
}

export default TurnosPaciente;
