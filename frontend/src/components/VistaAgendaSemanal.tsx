import type { Turno } from "../types/Turno";
import { formatearHora } from "../utils/fecha";

const DIAS_NOMBRES = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
const HORAS_INICIO = 8;
const HORAS_FIN = 20;
const ALTURA_HORA = 64;
const ALTURA_EVENTO = 54;

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

interface Props {
  diasSemana: Date[];
  turnosDelDia: (fecha: Date) => Turno[];
}

export default function VistaAgendaSemanal({ diasSemana, turnosDelDia }: Props) {
  const hoy = new Date();
  const alturaTotal = (HORAS_FIN - HORAS_INICIO) * ALTURA_HORA;

  return (
    <div className="agenda-scroll">
      {/* Encabezado con nombres de día y números — sticky */}
      <div className="agenda-semana-header">
        <div className="agenda-col-horas" />
        {diasSemana.map((dia, i) => {
          const esHoy = esMismaFecha(dia, hoy);
          return (
            <div key={i} className="agenda-dia-header">
              <span className="agenda-dia-nombre">{DIAS_NOMBRES[i]}</span>
              <span className={`agenda-dia-numero${esHoy ? " agenda-dia-hoy" : ""}`}>
                {dia.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Grid de horas + columnas por día */}
      <div className="agenda-grid">
        {/* Columna de horas */}
        <div className="agenda-col-horas">
          {horas.map((h) => (
            <div key={h} className="agenda-hora-label">
              {formatHora(h)}
            </div>
          ))}
        </div>

        {/* Una columna por día */}
        {diasSemana.map((dia, i) => {
          const turnos = turnosDelDia(dia);
          return (
            <div key={i} className="agenda-dia-col" style={{ height: alturaTotal }}>
              {horas.map((h) => (
                <div key={h} className="agenda-hora-fila" />
              ))}
              {turnos.map((turno) => {
                const hora = formatearHora(turno.fechaHora);
                const top = calcularTop(hora);
                const estadoClass = `estado-${turno.estado.toLowerCase()}`;
                return (
                  <div
                    key={turno.id}
                    className={`agenda-evento agenda-evento-compact ${estadoClass}`}
                    style={{ top, height: ALTURA_EVENTO }}
                  >
                    <p className="agenda-evento-hora">{hora}</p>
                    <p className="agenda-evento-paciente">
                      {turno.paciente.usuario.nombre} {turno.paciente.usuario.apellido}
                    </p>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
