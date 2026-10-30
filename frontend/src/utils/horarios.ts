// Grilla única de horarios del consultorio: cada 30 minutos, de 08:00 a 19:30.
// La usan PedirTurno (paciente) y NuevoTurnoModal (secretaria) para que los
// dos ofrezcan exactamente los mismos horarios: si no, un turno a las 11:00 y
// otro a las 11:15 con el mismo médico no se detectarían como superpuestos.
const PRIMERA_HORA = 8;
const ULTIMA_HORA = 19;

export const HORARIOS_CONSULTORIO: string[] = Array.from(
  { length: (ULTIMA_HORA - PRIMERA_HORA + 1) * 2 },
  (_, i) => {
    const hora = PRIMERA_HORA + Math.floor(i / 2);
    const minutos = i % 2 === 0 ? "00" : "30";
    return `${String(hora).padStart(2, "0")}:${minutos}`;
  }
);

// Un horario no se puede elegir si ya está tomado o si es de hoy y ya pasó
export function horarioNoDisponible(fecha: string, hora: string, ocupados: Set<string>) {
  return ocupados.has(hora) || new Date(`${fecha}T${hora}:00`) <= new Date();
}

// Cuántos horarios le quedan libres a un día
export function horariosLibres(fecha: string, ocupados: Set<string>) {
  return HORARIOS_CONSULTORIO.filter((h) => !horarioNoDisponible(fecha, h, ocupados)).length;
}

// La clínica atiende de lunes a viernes (el back aplica la misma regla)
export const esDiaHabil = (d: Date) => d.getDay() >= 1 && d.getDay() <= 5;

// Fecha local como "YYYY-MM-DD" (la clave que usan el selector y la grilla)
export const claveFecha = (d: Date) => d.toLocaleDateString("en-CA");

// Los próximos `cantidad` días hábiles a partir de `desde` (incluido), saltando
// los primeros `saltear` (para avanzar de a bloques en el selector)
export function diasHabiles(desde: Date, cantidad: number, saltear = 0): Date[] {
  const dias: Date[] = [];
  const d = new Date(desde);
  d.setHours(0, 0, 0, 0);
  let salteados = 0;
  while (dias.length < cantidad) {
    if (esDiaHabil(d)) {
      if (salteados < saltear) salteados++;
      else dias.push(new Date(d));
    }
    d.setDate(d.getDate() + 1);
  }
  return dias;
}
