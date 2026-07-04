import { useAuth } from "../hooks/useAuth";
import { useTurnosPaciente } from "../hooks/useTurnosPaciente";
import { ProximoTurnoCard } from "./ProximoTurnoCard";
import { AccesosRapidosPaciente } from "./AccesosRapidosPaciente";
import "../assets/styles/HomePaciente.css";
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
      <div className="home-paciente-saludo">
        <p className="home-paciente-nombre">Hola, {usuario?.docs?.nombre}</p>
        <p className="home-paciente-fecha">{formatearFechaHoy()}</p>
      </div>
      <ProximoTurnoCard turno={proximoTurno} />
      <AccesosRapidosPaciente />
    </div>
  );
}