import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

// Horarios ("HH:MM", hora local) que el médico ya tiene tomados en el día
// elegido. GET /api/turnos/ocupados devuelve solo fechas, sin datos de otros
// pacientes, así que lo puede consultar el paciente (RN-002).
// `recargar` cambia de valor para volver a pedirlos (por ejemplo, después de
// un 409 porque otro paciente tomó el horario mientras tanto).
export function useHorariosOcupados(medicoId: string, fecha: string, recargar = 0) {
  const [ocupados, setOcupados] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!medicoId || !fecha) return;

    let vigente = true;
    const desde = new Date(`${fecha}T00:00:00`);
    const hasta = new Date(desde);
    hasta.setDate(hasta.getDate() + 1);
    const query = new URLSearchParams({
      medicoId,
      desde: desde.toISOString(),
      hasta: hasta.toISOString(),
    });

    apiFetch<string[]>(`/turnos/ocupados?${query}`)
      .then((fechas) => {
        if (!vigente) return;
        const horas = fechas.map((f) =>
          new Date(f).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })
        );
        setOcupados(new Set(horas));
      })
      // Si falla, no bloqueamos nada: el back igual rechaza el horario con 409
      .catch(() => vigente && setOcupados(new Set()));

    // Una respuesta vieja (cambió el médico o la fecha) no pisa a la nueva
    return () => { vigente = false; };
  }, [medicoId, fecha, recargar]);

  return medicoId && fecha ? ocupados : new Set<string>();
}
