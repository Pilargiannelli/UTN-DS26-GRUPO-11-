import { useAuth } from "../hooks/useAuth";
import { useTurnosPaciente } from "../hooks/useTurnosPaciente";
import { ProximoTurnoCard } from "./ProximoTurnoCard";
import { AccesosRapidosPaciente } from "./AccesosRapidosPaciente";
import "../assets/styles/PaginaPaciente.css";

function formatearFechaHoy() {
  const hoy = new Date();
  return hoy.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
}

export function HomePaciente() {
  const { usuario } = useAuth();
  const { proximoTurno } = useTurnosPaciente();

  return (
    <div className="home-paciente pagina-paciente">
      <div className="hero">
        <div className="home-paciente-saludo hero-left">
          <h1>👋 Buenos días, {usuario?.nombre}</h1>
          <p>{formatearFechaHoy()}</p>
        </div>
        <div className="hero-right">
          <ProximoTurnoCard turno={proximoTurno} />
        </div>
      </div>
      <AccesosRapidosPaciente />
    </div>
  );
}