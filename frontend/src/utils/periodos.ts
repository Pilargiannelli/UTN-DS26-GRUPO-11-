// Filtro por período de los listados del médico (historial de consultas y turnos del paciente)

export type Periodo = "todo" | "proximos" | "anteriores" | "semana" | "mes" | "anio" | "personalizado";

export const ETIQUETAS_PERIODO: Record<Periodo, string> = {
  todo: "Todas",
  proximos: "Próximos",
  anteriores: "Anteriores",
  semana: "Última semana",
  mes: "Último mes",
  anio: "Último año",
  personalizado: "Personalizado",
};

export interface RangoFechas {
  desde: Date | null;
  hasta: Date | null;
}

// "AAAA-MM-DD" (campo de fecha) -> inicio o fin de ese día, en hora local
const inicioDelDia = (valor: string) => (valor ? new Date(`${valor}T00:00:00`) : null);
const finDelDia = (valor: string) => (valor ? new Date(`${valor}T23:59:59.999`) : null);

// Rango de fechas que corresponde al período elegido. "Última semana", "Último mes" y "Último año"
// cuentan hacia atrás desde ahora; "Personalizado" usa las fechas que cargó el médico (cualquiera
// de las dos puede quedar vacía).
export function rangoDePeriodo(periodo: Periodo, desde = "", hasta = "", ahora = new Date()): RangoFechas {
  const atras = (ajustar: (d: Date) => void) => {
    const d = new Date(ahora);
    ajustar(d);
    return d;
  };
  switch (periodo) {
    case "semana":
      return { desde: atras((d) => d.setDate(d.getDate() - 7)), hasta: ahora };
    case "mes":
      return { desde: atras((d) => d.setMonth(d.getMonth() - 1)), hasta: ahora };
    case "anio":
      return { desde: atras((d) => d.setFullYear(d.getFullYear() - 1)), hasta: ahora };
    case "proximos":
      return { desde: ahora, hasta: null };
    case "anteriores":
      return { desde: null, hasta: ahora };
    case "personalizado":
      return { desde: inicioDelDia(desde), hasta: finDelDia(hasta) };
    default:
      return { desde: null, hasta: null };
  }
}

export function enRango(fechaISO: string, { desde, hasta }: RangoFechas) {
  const fecha = new Date(fechaISO).getTime();
  if (desde && fecha < desde.getTime()) return false;
  if (hasta && fecha > hasta.getTime()) return false;
  return true;
}

// Minúsculas y sin tildes, para buscar texto sin importar cómo se escribió
export const normalizarTexto = (texto: string) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("es-AR").trim();
