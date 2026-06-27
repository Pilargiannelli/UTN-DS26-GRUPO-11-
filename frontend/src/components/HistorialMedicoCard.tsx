import type { Usuario } from "../types/Usuario";
import type { Consulta } from "../types/ConsultaProps";
import { ConsultaCard } from "./ConsultaCard";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../assets/styles/HistorialMedicoCard.css"

interface HistorialMedicoCardProps {
  usuario: Usuario;
}

export function HistorialMedicoCard({ usuario }: HistorialMedicoCardProps) {
  const historial = (usuario as Usuario & { docs?: { historial?: { consultas?: Consulta[] } } }).docs?.historial;
  const consultas = historial?.consultas ?? [];
  // Ordenar por fecha descendente
  const consultasOrdenadas = [...consultas].sort(
    (a: Consulta, b: Consulta) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );
  return (
    <div className="historial-card shadow-sm">
      <h4>Historial Médico</h4>
      <div className="consultas-scroll">
        {consultasOrdenadas.length > 0 ? (
          consultasOrdenadas.map((consulta, i) => (
            <ConsultaCard key={i} consulta={consulta} />
          ))
        ) : (
          <p>No hay consultas registradas.</p>
        )}
      </div>
    </div>
  );
}
