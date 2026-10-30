import { useAuth } from "./useAuth";
import { useHistoriaClinica } from "./useHistoriaClinica";
import type { EntradaClinica } from "../types/HistoriaClinica";
import type { Turno } from "../types/Turno";

// Historia clínica del paciente que inició sesión. El back solo le deja leer
// la propia (Ley 26.529: el paciente es titular de su historia clínica).
export function useMiHistoria() {
  const { usuario } = useAuth();
  const { historia, loading, error } = useHistoriaClinica(usuario?.paciente?.id ?? null);
  return { historia, loading, error };
}

const mismoDia = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// Las consultas no guardan de qué turno salieron: se asocian con el turno del
// mismo día (el médico la registra durante la atención)
export function consultaDelTurno(turno: Turno, entradas: EntradaClinica[]) {
  if (turno.estado === "Cancelado") return undefined;
  const dia = new Date(turno.fechaHora);
  return entradas.find((e) => mismoDia(new Date(e.fecha), dia));
}
