import { Turno } from "../types/turno.types";

const turnos: Turno[] = [
  { id: 1, paciente: "Juan Pérez", medico: "Dr. Font", especialidad: "Traumatología", fecha: "2026-07-03", hora: "09:00", obraSocial: "OSDE", estado: "Pendiente" },
  { id: 2, paciente: "Ana López", medico: "Dr. Castelli", especialidad: "Cardiología", fecha: "2026-07-03", hora: "09:30", obraSocial: "IOMA", estado: "Confirmado" },
  { id: 3, paciente: "Carlos Ruiz", medico: "Dr. Messi", especialidad: "Clínica Médica", fecha: "2026-07-03", hora: "10:00", obraSocial: "PAMI", estado: "Cancelado" },
];

let proximoId = turnos.length + 1;

export function findAll(): Turno[] {
  return turnos;
}

export function findById(id: number): Turno | undefined {
  return turnos.find((t) => t.id === id);
}

export function create(datos: Omit<Turno, "id">): Turno {
  const nuevo: Turno = { id: proximoId++, ...datos };
  turnos.push(nuevo);
  return nuevo;
}

export function update(id: number, datos: Omit<Turno, "id">): Turno | undefined {
  const index = turnos.findIndex((t) => t.id === id);
  if (index === -1) return undefined;
  turnos[index] = { id, ...datos };
  return turnos[index];
}

export function remove(id: number): boolean {
  const index = turnos.findIndex((t) => t.id === id);
  if (index === -1) return false;
  turnos.splice(index, 1);
  return true;
}