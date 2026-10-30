import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import { claveFecha } from "../utils/horarios";

interface Resultado {
  clave: string;
  porDia: Record<string, Set<string>>;
}

// Horarios ("HH:MM") que el médico ya tiene tomados en cada día de un rango,
// en un solo pedido a GET /api/turnos/ocupados (solo fechas, sin datos de
// pacientes). `recargar` cambia de valor para volver a pedirlos, por ejemplo
// después de un 409 porque otro paciente tomó el horario mientras tanto.
export function useDisponibilidad(medicoId: string, dias: Date[], recargar = 0) {
  const desde = dias[0];
  const hasta = dias.length ? new Date(dias[dias.length - 1]) : undefined;
  hasta?.setDate(hasta.getDate() + 1);
  const clave = medicoId && desde && hasta ? `${medicoId}|${desde.toISOString()}|${hasta.toISOString()}|${recargar}` : "";

  const [resultado, setResultado] = useState<Resultado | null>(null);

  useEffect(() => {
    if (!clave) return;
    const [id, inicio, fin] = clave.split("|");

    let vigente = true;
    const query = new URLSearchParams({ medicoId: id, desde: inicio, hasta: fin });
    apiFetch<string[]>(`/turnos/ocupados?${query}`)
      .then((fechas) => {
        if (!vigente) return;
        const porDia: Record<string, Set<string>> = {};
        fechas.forEach((f) => {
          const fecha = new Date(f);
          const hora = fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
          (porDia[claveFecha(fecha)] ??= new Set()).add(hora);
        });
        setResultado({ clave, porDia });
      })
      // Si falla, no bloqueamos nada: el back igual rechaza el horario con 409
      .catch(() => vigente && setResultado({ clave, porDia: {} }));

    // Una respuesta vieja (cambió el médico o la semana) no pisa a la nueva
    return () => { vigente = false; };
  }, [clave]);

  const actual = resultado?.clave === clave ? resultado : null;
  return {
    ocupadosPorDia: actual?.porDia ?? {},
    cargando: !!clave && actual === null,
  };
}
