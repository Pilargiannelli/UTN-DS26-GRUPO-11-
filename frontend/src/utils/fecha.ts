const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// El back manda fechaHora como string ISO (DateTime de Prisma -> JSON), no
// como Date: hay que parsearlo explícitamente en el front (Filmina 18 de C19).
export function parseFechaHora(fechaHoraISO: string): Date {
  return new Date(fechaHoraISO);
}

export function formatearChipFecha(fechaHoraISO: string) {
  const d = parseFechaHora(fechaHoraISO);
  const dia = String(d.getDate()).padStart(2, "0");
  return { dia, mes: MESES[d.getMonth()] };
}

export function formatearHora(fechaHoraISO: string) {
  const d = parseFechaHora(fechaHoraISO);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function formatearFechaLarga(fechaHoraISO: string) {
  return parseFechaHora(fechaHoraISO).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
