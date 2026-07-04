import { useState } from "react";
import { Container } from "react-bootstrap";
import { useTurnosMedico } from "../hooks/useTurnosMedico";
import VistaAgendaSemanal from "../components/VistaAgendaSemanal";
import Layout from "../components/Layout/Layout";
import "../assets/styles/OrdenDelDia.css";

type Vista = "dia" | "semana";

const HORAS_INICIO = 8;
const HORAS_FIN = 20;
const ALTURA_HORA = 64;
const ALTURA_EVENTO = 56;

const DIAS_SEMANA = [
  "domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado",
];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const MESES_CORTOS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

const horas = Array.from(
  { length: HORAS_FIN - HORAS_INICIO },
  (_, i) => HORAS_INICIO + i
);

function formatHora(h: number) {
  return `${String(h).padStart(2, "0")}:00`;
}

function calcularTop(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return (h - HORAS_INICIO + m / 60) * ALTURA_HORA;
}

function esMismaFecha(a: Date, b: Date) {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

// Devuelve los 7 días de la semana (lun–dom) que contienen la fecha dada
function obtenerSemana(fecha: Date): Date[] {
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  const dia = d.getDay(); // 0=Dom … 6=Sáb
  const lunes = new Date(d);
  lunes.setDate(d.getDate() - (dia === 0 ? 6 : dia - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(lunes);
    day.setDate(lunes.getDate() + i);
    return day;
  });
}

function subtituloSemana(dias: Date[]): string {
  const ini = dias[0];
  const fin = dias[6];
  const iniMes = MESES_CORTOS[ini.getMonth()];
  const finMes = MESES_CORTOS[fin.getMonth()];
  const año = fin.getFullYear();
  if (ini.getMonth() === fin.getMonth()) {
    return `${ini.getDate()} – ${fin.getDate()} de ${finMes} de ${año}`;
  }
  return `${ini.getDate()} ${iniMes} – ${fin.getDate()} ${finMes} de ${año}`;
}

export default function OrdenDelDia() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [vista, setVista] = useState<Vista>("dia");
  const { turnosDelDia } = useTurnosMedico();

  const turnos = turnosDelDia(fechaSeleccionada);
  const esHoy = esMismaFecha(fechaSeleccionada, new Date());
  const diasSemana = obtenerSemana(fechaSeleccionada);

  const irAtras = () => {
    const d = new Date(fechaSeleccionada);
    d.setDate(d.getDate() - (vista === "semana" ? 7 : 1));
    setFechaSeleccionada(d);
  };

  const irAdelante = () => {
    const d = new Date(fechaSeleccionada);
    d.setDate(d.getDate() + (vista === "semana" ? 7 : 1));
    setFechaSeleccionada(d);
  };

  const irAHoy = () => setFechaSeleccionada(new Date());

  // En vista semana, "hoy" es cuando la semana contiene el día de hoy
  const hoyEnSemana = diasSemana.some((d) => esMismaFecha(d, new Date()));
  const mostrarBtnHoy = vista === "dia" ? !esHoy : !hoyEnSemana;

  return (
    <Layout>
    <Container className="py-4">
      {/* Encabezado: título + toggle + navegación */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="agenda-titulo">Orden del día</h2>
        <div className="d-flex align-items-center gap-3">
          {/* Toggle Día / Semana */}
          <div className="agenda-toggle">
            <button
              className={`agenda-toggle-btn${vista === "dia" ? " activo" : ""}`}
              onClick={() => setVista("dia")}
            >
              Día
            </button>
            <button
              className={`agenda-toggle-btn${vista === "semana" ? " activo" : ""}`}
              onClick={() => setVista("semana")}
            >
              Semana
            </button>
          </div>
          {/* Navegación prev / hoy / next */}
          <div className="d-flex align-items-center gap-2">
            <button className="agenda-nav-btn" onClick={irAtras} aria-label="Anterior">
              ‹
            </button>
            {mostrarBtnHoy && (
              <button className="agenda-hoy-btn" onClick={irAHoy}>
                Hoy
              </button>
            )}
            <button className="agenda-nav-btn" onClick={irAdelante} aria-label="Siguiente">
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Subtítulo de fecha */}
      <div className="mb-3">
        {vista === "dia" ? (
          <>
            <p className="agenda-fecha-sub">{DIAS_SEMANA[fechaSeleccionada.getDay()]}</p>
            <p className="agenda-fecha-header">
              {fechaSeleccionada.getDate()} de {MESES[fechaSeleccionada.getMonth()]} de{" "}
              {fechaSeleccionada.getFullYear()}
            </p>
          </>
        ) : (
          <p className="agenda-fecha-header">{subtituloSemana(diasSemana)}</p>
        )}
      </div>

      {/* ── Vista diaria ── */}
      {vista === "dia" && (
        <div className="agenda-scroll">
          <div className="agenda-grid">
            <div className="agenda-col-horas">
              {horas.map((h) => (
                <div key={h} className="agenda-hora-label">
                  {formatHora(h)}
                </div>
              ))}
            </div>
            <div
              className="agenda-col-eventos"
              style={{ height: (HORAS_FIN - HORAS_INICIO) * ALTURA_HORA }}
            >
              {horas.map((h) => (
                <div key={h} className="agenda-hora-fila" />
              ))}
              {turnos.length === 0 && (
                <div className="agenda-sin-turnos">Sin turnos para este día</div>
              )}
              {turnos.map((turno) => {
                const top = calcularTop(turno.hora);
                const estadoClass = `estado-${turno.estado.toLowerCase()}`;
                return (
                  <div
                    key={turno.id}
                    className={`agenda-evento ${estadoClass}`}
                    style={{ top, height: ALTURA_EVENTO }}
                  >
                    <p className="agenda-evento-hora">{turno.hora}</p>
                    <p className="agenda-evento-paciente">{turno.paciente}</p>
                    <p className="agenda-evento-especialidad">{turno.especialidad}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Vista semanal ── */}
      {vista === "semana" && (
        <VistaAgendaSemanal diasSemana={diasSemana} turnosDelDia={turnosDelDia} />
      )}
    </Container>
    </Layout>
  );
}
