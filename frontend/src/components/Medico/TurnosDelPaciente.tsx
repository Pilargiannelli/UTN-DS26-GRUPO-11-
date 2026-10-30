import { useState } from "react";
import { Badge, Button, Spinner } from "react-bootstrap";
import { useFetch } from "../../hooks/useFetch";
import { formatearHora } from "../../utils/fecha";
import type { Turno } from "../../types/Turno";

const COLOR_ESTADO: Record<string, string> = {
  Pendiente: "warning",
  Reprogramado: "warning",
  Confirmado: "info",
  Cancelado: "danger",
};

// Cuántos turnos anteriores se ven antes de "Ver más"
const ANTERIORES_VISIBLES = 3;

function FilaTurno({ turno, pasado }: { turno: Turno; pasado: boolean }) {
  return (
    <li className={`panel-medico-turno ${pasado ? "panel-medico-turno-pasado" : ""}`}>
      <span>
        <span className="panel-medico-turno-fecha">
          {new Date(turno.fechaHora).toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
          {" · "}
          {formatearHora(turno.fechaHora)} hs
        </span>
        <span className="panel-medico-turno-detalle">{turno.medico.especialidad}</span>
      </span>
      <Badge bg={COLOR_ESTADO[turno.estado] ?? "secondary"}>
        {pasado && turno.estado !== "Cancelado" ? "Realizado" : turno.estado}
      </Badge>
    </li>
  );
}

// Turnos del paciente con este médico: próximos y anteriores. GET /api/turnos
// ya devuelve solo la agenda del médico; acá se filtra por paciente.
export function TurnosDelPaciente({ pacienteId }: { pacienteId: number }) {
  const { data, loading, error } = useFetch<Turno[]>("/turnos");
  const [verTodos, setVerTodos] = useState(false);

  if (loading) return <Spinner animation="border" size="sm" role="status" aria-label="Cargando turnos" />;
  if (error) return <p className="panel-medico-vacio">No se pudieron cargar los turnos: {error.message}</p>;

  const ahora = new Date();
  const delPaciente = (data ?? []).filter((t) => t.pacienteId === pacienteId);
  const proximos = delPaciente
    .filter((t) => new Date(t.fechaHora) >= ahora && t.estado !== "Cancelado")
    .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));
  const anteriores = delPaciente
    .filter((t) => new Date(t.fechaHora) < ahora)
    .sort((a, b) => b.fechaHora.localeCompare(a.fechaHora));
  const anterioresVisibles = verTodos ? anteriores : anteriores.slice(0, ANTERIORES_VISIBLES);

  return (
    <>
      <h3 className="panel-medico-subtitulo">Próximos</h3>
      {proximos.length === 0 ? (
        <p className="panel-medico-vacio">No tiene turnos próximos.</p>
      ) : (
        <ul className="panel-medico-turnos">
          {proximos.map((t) => <FilaTurno key={t.id} turno={t} pasado={false} />)}
        </ul>
      )}

      <h3 className="panel-medico-subtitulo">Anteriores</h3>
      {anteriores.length === 0 ? (
        <p className="panel-medico-vacio">Todavía no tuvo turnos.</p>
      ) : (
        <>
          <ul className="panel-medico-turnos">
            {anterioresVisibles.map((t) => <FilaTurno key={t.id} turno={t} pasado />)}
          </ul>
          {anteriores.length > ANTERIORES_VISIBLES && (
            <Button variant="link" size="sm" className="p-0" onClick={() => setVerTodos((v) => !v)}>
              {verTodos ? "Ver menos" : `Ver más (${anteriores.length - ANTERIORES_VISIBLES})`}
            </Button>
          )}
        </>
      )}
    </>
  );
}
