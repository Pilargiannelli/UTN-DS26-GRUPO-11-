import { Link } from "react-router-dom";
import { Calendar2Plus, CalendarEvent, CalendarWeek, Clock, CreditCard2Front, Person, PlusCircle } from "react-bootstrap-icons";
import { useFetch } from "../../hooks/useFetch";
import { formatearHora } from "../../utils/fecha";
import type { CoberturaPaciente } from "../../types/Usuario";
import type { Turno } from "../../types/Turno";
import "../../assets/styles/TurnosDeHoy.css";

interface TurnosDeHoyProps {
  turnos: Turno[];
  onAgendar: () => void;
}

interface PacienteConCobertura {
  id: number;
  coberturas?: CoberturaPaciente[];
}

// Clave del día en hora local (AAAA-MM-DD)
const claveDia = (fecha: Date) => fecha.toLocaleDateString("en-CA");

const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

// Inicio del médico: los turnos confirmados que tiene hoy, de la mañana a la tarde.
export function TurnosDeHoy({ turnos, onAgendar }: TurnosDeHoyProps) {
  // La obra social no viene en el turno: se toma de la ficha del paciente (GET /api/pacientes lo permite al médico)
  const { data: pacientes } = useFetch<PacienteConCobertura[]>("/pacientes");

  const hoy = new Date();
  const deHoy = turnos
    .filter((t) => t.estado === "Confirmado" && claveDia(new Date(t.fechaHora)) === claveDia(hoy))
    .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));

  const obraSocialDe = (pacienteId: number) =>
    pacientes?.find((p) => p.id === pacienteId)?.coberturas?.[0]?.obraSocial.nombre ?? "Sin obra social";

  const fecha = capitalizar(hoy.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));

  return (
    <section className="turnos-hoy" aria-labelledby="turnos-hoy-titulo">
      <header className="turnos-hoy-encabezado">
        <span className="turnos-hoy-icono" aria-hidden="true"><Calendar2Plus /></span>
        <div className="turnos-hoy-titulos">
          <h2 id="turnos-hoy-titulo">Turnos de hoy</h2>
          <p>Listado de los turnos programados para hoy.</p>
        </div>
        <span className="turnos-hoy-fecha"><CalendarEvent aria-hidden="true" />{fecha}</span>
      </header>

      {deHoy.length === 0 ? (
        <div className="turnos-hoy-vacio">
          <svg className="turnos-hoy-vacio-dibujo" viewBox="0 0 120 100" aria-hidden="true">
            <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <rect x="22" y="30" width="62" height="56" rx="9" />
              <path d="M22 48H84M40 22V36M66 22V36M92 24L97 14M98 32L110 28M96 40L108 40" />
            </g>
          </svg>
          <h3>No tenés turnos programados para hoy</h3>
          <p>Podés agendar un nuevo turno o consultar la agenda.</p>
          <div className="turnos-hoy-acciones">
            <button type="button" className="turnos-hoy-boton turnos-hoy-boton-principal" onClick={onAgendar}>
              <PlusCircle aria-hidden="true" />Agendar turno
            </button>
            <Link to="/orden-del-dia" className="turnos-hoy-boton">
              <CalendarWeek aria-hidden="true" />Ver agenda
            </Link>
          </div>
        </div>
      ) : (
        <table className="turnos-hoy-tabla">
          <thead>
            <tr>
              <th scope="col"><Clock aria-hidden="true" />Hora</th>
              <th scope="col"><Person aria-hidden="true" />Paciente</th>
              <th scope="col"><CreditCard2Front aria-hidden="true" />Obra social</th>
            </tr>
          </thead>
          <tbody>
            {deHoy.map((t) => (
              <tr key={t.id}>
                <td className="turnos-hoy-hora">{formatearHora(t.fechaHora)}</td>
                <td className="turnos-hoy-paciente">{t.paciente.usuario.nombre} {t.paciente.usuario.apellido}</td>
                <td>{obraSocialDe(t.pacienteId)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
