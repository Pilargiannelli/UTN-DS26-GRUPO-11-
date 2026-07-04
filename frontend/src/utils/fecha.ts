const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function parseFecha(fecha: string): Date {
  const [d, m, y] = fecha.split("/").map(Number);
  return new Date(y, m - 1, d);
}

export function formatearChipFecha(fecha: string) {
  const [dia, mes] = fecha.split("/");
  return { dia, mes: MESES[Number(mes) - 1] };
}