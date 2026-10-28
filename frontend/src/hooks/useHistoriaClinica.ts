import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import type { HistoriaClinica } from "../types/HistoriaClinica";

interface Resultado {
  pacienteId: number;
  historia: HistoriaClinica | null;
  error: Error | null;
}

// Historia clínica de un paciente (id de Paciente, no de Usuario). Las
// operaciones del médico devuelven la historia actualizada, así que se
// reemplaza el estado con esa respuesta sin volver a pedirla.
export function useHistoriaClinica(pacienteId: number | null) {
  // Se guarda de qué paciente es la respuesta: mientras no sea la del
  // paciente elegido, está cargando
  const [resultado, setResultado] = useState<Resultado | null>(null);

  useEffect(() => {
    if (!pacienteId) return;

    let vigente = true;
    apiFetch<HistoriaClinica>(`/pacientes/${pacienteId}/historia-clinica`)
      .then((historia) => vigente && setResultado({ pacienteId, historia, error: null }))
      .catch((e) => vigente && setResultado({ pacienteId, historia: null, error: e as Error }));

    return () => { vigente = false; };
  }, [pacienteId]);

  const agregarEntrada = useCallback(
    async (datos: { diagnostico: string; evolucion: string; observaciones: string }) => {
      if (!pacienteId) return;
      const historia = await apiFetch<HistoriaClinica>(`/pacientes/${pacienteId}/historia-clinica/entradas`, {
        method: "POST",
        body: JSON.stringify(datos),
      });
      setResultado({ pacienteId, historia, error: null });
    },
    [pacienteId]
  );

  const actualizarListas = useCallback(
    async (listas: { alergias: string[]; antecedentes: string[] }) => {
      if (!pacienteId) return;
      const historia = await apiFetch<HistoriaClinica>(`/pacientes/${pacienteId}/historia-clinica`, {
        method: "PUT",
        body: JSON.stringify(listas),
      });
      setResultado({ pacienteId, historia, error: null });
    },
    [pacienteId]
  );

  const actual = resultado && resultado.pacienteId === pacienteId ? resultado : null;

  return {
    historia: actual?.historia ?? null,
    loading: pacienteId !== null && actual === null,
    error: actual?.error ?? null,
    agregarEntrada,
    actualizarListas,
  };
}
