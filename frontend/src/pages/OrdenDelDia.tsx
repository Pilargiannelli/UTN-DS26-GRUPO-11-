import { useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, ButtonGroup, Container, Spinner } from "react-bootstrap";
import { CalendarEvent, CalendarWeek, CheckSquare, ChevronLeft, ChevronRight, Clock } from "react-bootstrap-icons";
import { useTurnosMedico } from "../hooks/useTurnosMedico";
import { useFetch } from "../hooks/useFetch";
import { useAuth } from "../hooks/useAuth";
import VistaAgendaSemanal from "../components/VistaAgendaSemanal";
import { BuscadorSelect } from "../components/Turnos/BuscadorSelect";
import Layout from "../components/Layout/Layout";
import { EncabezadoPagina } from "../components/EncabezadoPagina";
import { formatearHora, parseFechaHora } from "../utils/fecha";
import { claveFecha, esDiaHabil } from "../utils/horarios";
import {
  ALTURA_TOTAL, HORAS, esMismaFecha, estiloGrilla, etiquetaHora, topAhora, ubicarTurnos,
} from "../utils/agenda";
import type { EstadoTurno } from "../types/Turno";
import "../assets/styles/OrdenDelDia.css";
import "../assets/styles/SecretariaAgenda.css";

type Vista = "dia" | "semana";

const ESTADOS: { estado: EstadoTurno; texto: string }[] = [
  { estado: "Confirmado", texto: "Confirmado" },
  { estado: "Pendiente", texto: "Pendiente" },
  { estado: "Reprogramado", texto: "Reprogramado" },
  { estado: "Cancelado", texto: "Cancelado" },
];

const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

// "Viernes 30 de octubre de 2026"
const tituloDia = (d: Date) =>
  capitalizar(d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));

// "26 – 30 de octubre de 2026" o "29 de octubre – 2 de noviembre de 2026"
function tituloSemana(dias: Date[]) {
  const ini = dias[0];
  const fin = dias[dias.length - 1];
  const mes = (d: Date) => d.toLocaleDateString("es-AR", { month: "long" });
  if (ini.getMonth() === fin.getMonth()) {
    return `${ini.getDate()} – ${fin.getDate()} de ${mes(fin)} de ${fin.getFullYear()}`;
  }
  return `${ini.getDate()} de ${mes(ini)} – ${fin.getDate()} de ${mes(fin)} de ${fin.getFullYear()}`;
}

// El consultorio atiende de lunes a viernes: la semana muestra esos 5 días
function semanaHabil(fecha: Date): Date[] {
  const lunes = new Date(fecha);
  lunes.setHours(0, 0, 0, 0);
  const dia = lunes.getDay();
  lunes.setDate(lunes.getDate() - (dia === 0 ? 6 : dia - 1));
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(lunes);
    d.setDate(lunes.getDate() + i);
    return d;
  });
}

// Día hábil siguiente o anterior (saltea sábado y domingo)
function moverDiaHabil(fecha: Date, paso: 1 | -1) {
  const d = new Date(fecha);
  do d.setDate(d.getDate() + paso); while (!esDiaHabil(d));
  return d;
}

const hoyHabil = () => {
  const hoy = new Date();
  return esDiaHabil(hoy) ? hoy : moverDiaHabil(hoy, 1);
};

const activo = (estado: EstadoTurno) => estado !== "Cancelado";

interface MedicoCartilla {
  id: number;
  especialidad: string;
  usuario: { nombre: string; apellido: string };
}

// La secretaria elige de qué médico ver la agenda (arranca con el primero)
function AgendaSecretaria() {
  const { data, loading, error } = useFetch<MedicoCartilla[]>("/medicos");
  // null: arranca con el primero; "ninguno": la cruz quitó la selección
  const [elegido, setElegido] = useState<number | "ninguno" | null>(null);
  const medicos = [...(data ?? [])].sort((a, b) => a.usuario.apellido.localeCompare(b.usuario.apellido));
  const sinMedico = elegido === "ninguno";
  const medicoId = sinMedico ? undefined : elegido ?? medicos[0]?.id;

  if (loading || error || (medicoId === undefined && !sinMedico)) {
    return <Agenda deSecretaria cargandoMedicos={loading} errorMedicos={error?.message ?? (loading ? null : "No hay médicos cargados.")} />;
  }

  const selector = (
    <BuscadorSelect
      ariaLabel="Médico"
      placeholder="Buscar médico o especialidad"
      value={medicoId === undefined ? "" : String(medicoId)}
      onChange={(v) => setElegido(v ? Number(v) : "ninguno")}
      detalleFijo
      opciones={medicos.map((m) => ({
        value: String(m.id),
        etiqueta: `${m.usuario.nombre} ${m.usuario.apellido}`,
        detalle: m.especialidad,
      }))}
    />
  );

  return <Agenda deSecretaria medicoId={medicoId} selector={selector} sinMedico={sinMedico} />;
}

// Agenda: el médico ve la suya; la secretaria, la de cada médico
export default function OrdenDelDia() {
  const { tieneRol } = useAuth();
  return tieneRol("SECRETARIA") ? <AgendaSecretaria /> : <Agenda />;
}

interface AgendaProps {
  deSecretaria?: boolean;
  medicoId?: number;
  selector?: ReactNode;
  cargandoMedicos?: boolean;
  errorMedicos?: string | null;
  // La secretaria quitó el médico: no hay agenda para mostrar
  sinMedico?: boolean;
}

// Turnos por día o por semana, en una grilla horaria. Cada turno lleva a la
// ficha del paciente.
function Agenda({ deSecretaria = false, medicoId, selector, cargandoMedicos = false, errorMedicos = null, sinMedico = false }: AgendaProps) {
  const [fecha, setFecha] = useState(hoyHabil);
  const [vista, setVista] = useState<Vista>("dia");
  const selectorFecha = useRef<HTMLInputElement>(null);
  const turnosMedico = useTurnosMedico(medicoId);
  const { misTurnos, turnosDelDia } = turnosMedico;
  const loading = turnosMedico.loading || cargandoMedicos;
  const error = turnosMedico.error ?? (errorMedicos ? new Error(errorMedicos) : null);

  const ahora = new Date();
  const dias = semanaHabil(fecha);
  const turnos = turnosDelDia(fecha);
  const enHoy = vista === "dia" ? esMismaFecha(fecha, ahora) : dias.some((d) => esMismaFecha(d, ahora));

  // El consultorio atiende de lunes a viernes: un fin de semana pasa al lunes
  const elegirFecha = (valor: string) => {
    if (!valor) return;
    const [anio, mes, dia] = valor.split("-").map(Number);
    const elegida = new Date(anio, mes - 1, dia);
    setFecha(esDiaHabil(elegida) ? elegida : moverDiaHabil(elegida, 1));
  };

  const abrirCalendario = () => {
    const entrada = selectorFecha.current;
    if (!entrada) return;
    if (typeof entrada.showPicker === "function") entrada.showPicker();
    else entrada.click();
  };

  const mover = (paso: 1 | -1) => {
    if (vista === "dia") {
      setFecha(moverDiaHabil(fecha, paso));
    } else {
      const d = new Date(fecha);
      d.setDate(d.getDate() + 7 * paso);
      setFecha(d);
    }
  };

  // Resumen del encabezado (sin contar cancelados)
  const semanaActual = semanaHabil(ahora);
  const datos = [
    { valor: turnosDelDia(ahora).filter((t) => activo(t.estado)).length, texto: "Turnos hoy", icono: <CalendarEvent /> },
    {
      valor: semanaActual.reduce((n, d) => n + turnosDelDia(d).filter((t) => activo(t.estado)).length, 0),
      texto: "Esta semana",
      icono: <CalendarWeek />,
    },
    {
      valor: misTurnos.filter((t) => (t.estado === "Pendiente" || t.estado === "Reprogramado")
        && parseFechaHora(t.fechaHora) >= ahora).length,
      texto: "Por confirmar",
      icono: <CheckSquare />,
    },
  ];

  const lineaAhora = esMismaFecha(fecha, ahora) ? topAhora(ahora) : null;

  return (
    <Layout>
      <Container className="agenda-medico">
        <EncabezadoPagina
          titulo="Agenda"
          etiqueta={deSecretaria ? "Agenda del consultorio" : "Mis turnos"}
          icono={<CalendarWeek />}
          descripcion={deSecretaria
            ? "Elegí un médico para ver sus turnos por horario. Tocá un turno para abrir la ficha del paciente."
            : "Tus turnos por horario. Tocá un turno para abrir la ficha y la historia clínica del paciente."}
          datos={loading || error || sinMedico ? undefined : datos}
        />

        <div className="agenda-panel">
          {/* Barra: fecha a la izquierda, navegación y vista a la derecha */}
          <div className="agenda-barra">
            <div className="agenda-barra-fecha">{selector}</div>

            <div className="agenda-barra-controles">
              <Button variant="outline-secondary" size="sm" className="agenda-btn-hoy" onClick={() => setFecha(hoyHabil())} disabled={enHoy}>
                Hoy
              </Button>
              <Button variant="outline-secondary" size="sm" className="agenda-btn-nav" onClick={() => mover(-1)} aria-label={vista === "dia" ? "Día anterior" : "Semana anterior"}>
                <ChevronLeft aria-hidden="true" />
              </Button>
              <h2 className="agenda-barra-titulo">
                <button type="button" className="agenda-fecha-boton" onClick={abrirCalendario} aria-label="Elegir una fecha en el calendario">
                  <span>{vista === "dia" ? tituloDia(fecha) : tituloSemana(dias)}</span>
                  <CalendarEvent aria-hidden="true" />
                </button>
                <input
                  ref={selectorFecha}
                  type="date"
                  className="agenda-fecha-entrada"
                  tabIndex={-1}
                  aria-hidden="true"
                  value={claveFecha(fecha)}
                  onChange={(e) => elegirFecha(e.target.value)}
                />
              </h2>
              {vista === "dia" && esMismaFecha(fecha, ahora) && <span className="agenda-barra-hoy">Hoy</span>}
              <Button variant="outline-secondary" size="sm" className="agenda-btn-nav" onClick={() => mover(1)} aria-label={vista === "dia" ? "Día siguiente" : "Semana siguiente"}>
                <ChevronRight aria-hidden="true" />
              </Button>
              <ButtonGroup size="sm" className="agenda-vista" aria-label="Vista">
                <Button
                  variant={vista === "dia" ? "primary" : "outline-primary"}
                  aria-pressed={vista === "dia"}
                  onClick={() => setVista("dia")}
                >
                  Día
                </Button>
                <Button
                  variant={vista === "semana" ? "primary" : "outline-primary"}
                  aria-pressed={vista === "semana"}
                  onClick={() => setVista("semana")}
                >
                  Semana
                </Button>
              </ButtonGroup>
            </div>
          </div>

          <ul className="agenda-leyenda" aria-label="Estados de turno">
            {ESTADOS.map(({ estado, texto }) => (
              <li key={estado} className={`agenda-leyenda-item estado-${estado.toLowerCase()}`}>{texto}</li>
            ))}
          </ul>

          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" aria-label="Cargando agenda" />
            </div>
          )}
          {error && <Alert variant="danger" className="m-3">No se pudo cargar la agenda: {error.message}</Alert>}

          {/* ── Vista diaria ── */}
          {!loading && !error && sinMedico && (
            <div className="agenda-scroll agenda-sin-medico">
              <p>Buscá y elegí un médico para ver su agenda.</p>
            </div>
          )}

          {!loading && !error && !sinMedico && vista === "dia" && (
            <div className="agenda-scroll" style={estiloGrilla}>
              <div className="agenda-grid">
                <div className="agenda-col-horas">
                  {HORAS.map((h) => (
                    <div key={h} className="agenda-hora-label">{etiquetaHora(h)}</div>
                  ))}
                </div>
                <div className="agenda-col-eventos" style={{ height: ALTURA_TOTAL }}>
                  {HORAS.map((h) => (
                    <div key={h} className="agenda-hora-fila" />
                  ))}
                  {turnos.length === 0 && (
                    <div className="agenda-sin-turnos">No tenés turnos este día</div>
                  )}
                  {lineaAhora !== null && (
                    <div className="agenda-ahora" style={{ top: lineaAhora }} aria-hidden="true" />
                  )}
                  {ubicarTurnos(turnos).map(({ turno, estilo }) => {
                    const paciente = `${turno.paciente.usuario.nombre} ${turno.paciente.usuario.apellido}`;
                    return (
                      <Link
                        key={turno.id}
                        to={`/pacientes/${turno.pacienteId}`}
                        className={`agenda-evento estado-${turno.estado.toLowerCase()}`}
                        style={estilo}
                        aria-label={`${formatearHora(turno.fechaHora)}, ${paciente}, ${turno.estado}`}
                      >
                        <span className="agenda-evento-hora"><Clock className="agenda-evento-reloj" aria-hidden="true" />{formatearHora(turno.fechaHora)}</span>
                        <span className="agenda-evento-paciente">{paciente}</span>
                        <span className="agenda-evento-estado">{turno.estado}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Vista semanal ── */}
          {!loading && !error && !sinMedico && vista === "semana" && (
            <VistaAgendaSemanal diasSemana={dias} turnosDelDia={turnosDelDia} />
          )}
        </div>
      </Container>
    </Layout>
  );
}
