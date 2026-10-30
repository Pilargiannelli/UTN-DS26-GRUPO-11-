import { useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, ButtonGroup, Container, Spinner } from "react-bootstrap";
import { CalendarWeek, ChevronLeft, ChevronRight } from "react-bootstrap-icons";
import { useTurnosMedico } from "../hooks/useTurnosMedico";
import VistaAgendaSemanal from "../components/VistaAgendaSemanal";
import Layout from "../components/Layout/Layout";
import { EncabezadoPagina } from "../components/EncabezadoPagina";
import { formatearHora, parseFechaHora } from "../utils/fecha";
import { esDiaHabil } from "../utils/horarios";
import {
  ALTURA_TOTAL, HORAS, esMismaFecha, estiloGrilla, etiquetaHora, topAhora, ubicarTurnos,
} from "../utils/agenda";
import type { EstadoTurno } from "../types/Turno";
import "../assets/styles/OrdenDelDia.css";

type Vista = "dia" | "semana";

const ESTADOS: { estado: EstadoTurno; texto: string }[] = [
  { estado: "Pendiente", texto: "Pendiente" },
  { estado: "Confirmado", texto: "Confirmado" },
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

// Agenda del médico: sus turnos por día o por semana, en una grilla horaria.
// Cada turno lleva a la ficha del paciente.
export default function OrdenDelDia() {
  const [fecha, setFecha] = useState(hoyHabil);
  const [vista, setVista] = useState<Vista>("dia");
  const { misTurnos, turnosDelDia, loading, error } = useTurnosMedico();

  const ahora = new Date();
  const dias = semanaHabil(fecha);
  const turnos = turnosDelDia(fecha);
  const enHoy = vista === "dia" ? esMismaFecha(fecha, ahora) : dias.some((d) => esMismaFecha(d, ahora));

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
    { valor: turnosDelDia(ahora).filter((t) => activo(t.estado)).length, texto: "Turnos hoy" },
    {
      valor: semanaActual.reduce((n, d) => n + turnosDelDia(d).filter((t) => activo(t.estado)).length, 0),
      texto: "Esta semana",
    },
    {
      valor: misTurnos.filter((t) => (t.estado === "Pendiente" || t.estado === "Reprogramado")
        && parseFechaHora(t.fechaHora) >= ahora).length,
      texto: "Por confirmar",
    },
  ];

  const lineaAhora = esMismaFecha(fecha, ahora) ? topAhora(ahora) : null;

  return (
    <Layout>
      <Container className="agenda-medico">
        <EncabezadoPagina
          titulo="Agenda"
          etiqueta="Mis turnos"
          icono={<CalendarWeek />}
          descripcion="Tus turnos por horario. Tocá un turno para abrir la ficha y la historia clínica del paciente."
          datos={loading || error ? undefined : datos}
        />

        <div className="agenda-panel">
          {/* Barra: fecha a la izquierda, navegación y vista a la derecha */}
          <div className="agenda-barra">
            <div>
              <h2 className="agenda-barra-titulo">
                {vista === "dia" ? tituloDia(fecha) : tituloSemana(dias)}
              </h2>
              {vista === "dia" && esMismaFecha(fecha, ahora) && <span className="agenda-barra-hoy">Hoy</span>}
            </div>

            <div className="agenda-barra-controles">
              <Button variant="outline-secondary" size="sm" onClick={() => setFecha(hoyHabil())} disabled={enHoy}>
                Hoy
              </Button>
              <ButtonGroup size="sm" aria-label="Cambiar de fecha">
                <Button variant="outline-secondary" onClick={() => mover(-1)} aria-label={vista === "dia" ? "Día anterior" : "Semana anterior"}>
                  <ChevronLeft aria-hidden="true" />
                </Button>
                <Button variant="outline-secondary" onClick={() => mover(1)} aria-label={vista === "dia" ? "Día siguiente" : "Semana siguiente"}>
                  <ChevronRight aria-hidden="true" />
                </Button>
              </ButtonGroup>
              <ButtonGroup size="sm" aria-label="Vista">
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
          {!loading && !error && vista === "dia" && (
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
                        <span className="agenda-evento-hora">{formatearHora(turno.fechaHora)}</span>
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
          {!loading && !error && vista === "semana" && (
            <VistaAgendaSemanal diasSemana={dias} turnosDelDia={turnosDelDia} />
          )}
        </div>
      </Container>
    </Layout>
  );
}
