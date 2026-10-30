import { useState } from "react";
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";
import { useDisponibilidad } from "../hooks/useDisponibilidad";
import {
  HORARIOS_CONSULTORIO,
  claveFecha,
  diasHabiles,
  horarioNoDisponible,
  horariosLibres,
} from "../utils/horarios";
import "../assets/styles/SelectorTurno.css";

// Días hábiles que se ven por vez (dos semanas)
const DIAS_POR_PAGINA = 10;
// Desde cuántos libres un día se marca como "quedan pocos"
const POCOS_LIBRES = 6;

interface SelectorTurnoProps {
  medicoId: string;
  fecha: string;   // "YYYY-MM-DD" o ""
  hora: string;    // "HH:MM" o ""
  onFecha: (fecha: string) => void;
  onHora: (hora: string) => void;
  recargar?: number;
}

const DIA_CORTO = new Intl.DateTimeFormat("es-AR", { weekday: "short" });
const FECHA_CORTA = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short" });
const FECHA_LARGA = new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long" });

// Elegir un turno viendo la disponibilidad: primero una tira con los próximos
// días hábiles y cuántos horarios libres le quedan a cada uno, después la
// grilla de horarios del día elegido. La clínica atiende de lunes a viernes.
export function SelectorTurno({ medicoId, fecha, hora, onFecha, onHora, recargar = 0 }: SelectorTurnoProps) {
  const [pagina, setPagina] = useState(0);
  const dias = diasHabiles(new Date(), DIAS_POR_PAGINA, pagina * DIAS_POR_PAGINA);
  const { ocupadosPorDia, cargando } = useDisponibilidad(medicoId, dias, recargar);

  if (!medicoId) {
    return <p className="selector-turno-ayuda">Elegí un profesional para ver los días y horarios disponibles.</p>;
  }

  const ocupadosDelDia = ocupadosPorDia[fecha] ?? new Set<string>();
  const primero = dias[0];
  const ultimo = dias[dias.length - 1];

  return (
    <div className="selector-turno">
      {/* ── Días ── */}
      <div className="selector-turno-encabezado">
        <span className="selector-turno-rango">
          {FECHA_CORTA.format(primero)} al {FECHA_CORTA.format(ultimo)}
        </span>
        <div className="selector-turno-flechas">
          <button
            type="button"
            className="selector-turno-flecha"
            onClick={() => setPagina((p) => p - 1)}
            disabled={pagina === 0}
            aria-label="Días anteriores"
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            className="selector-turno-flecha"
            onClick={() => setPagina((p) => p + 1)}
            aria-label="Días siguientes"
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="selector-turno-dias" role="group" aria-label="Días disponibles">
        {dias.map((d) => {
          const clave = claveFecha(d);
          const libres = horariosLibres(clave, ocupadosPorDia[clave] ?? new Set());
          const completo = !cargando && libres === 0;
          const nivel = completo ? "completo" : libres <= POCOS_LIBRES ? "pocos" : "muchos";
          const elegido = clave === fecha;
          return (
            <button
              key={clave}
              type="button"
              className={`selector-turno-dia selector-turno-dia-${cargando ? "cargando" : nivel} ${elegido ? "selector-turno-dia-elegido" : ""}`}
              onClick={() => onFecha(clave)}
              disabled={completo}
              aria-pressed={elegido}
              aria-label={`${FECHA_LARGA.format(d)}: ${cargando ? "cargando" : completo ? "sin horarios" : `${libres} horarios libres`}`}
            >
              <span className="selector-turno-dia-nombre">{DIA_CORTO.format(d).replace(".", "")}</span>
              <span className="selector-turno-dia-fecha">{FECHA_CORTA.format(d).replace(".", "")}</span>
              <span className="selector-turno-dia-libres">
                {cargando ? "…" : completo ? "Completo" : `${libres} libres`}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Horarios del día elegido ── */}
      {!fecha ? (
        <p className="selector-turno-ayuda">Elegí un día para ver sus horarios.</p>
      ) : (
        <div className="selector-turno-horarios-bloque">
          <p className="selector-turno-dia-titulo">
            Horarios del {FECHA_LARGA.format(new Date(`${fecha}T00:00:00`))}
          </p>
          <div className="selector-turno-horarios" role="group" aria-label="Horarios">
            {HORARIOS_CONSULTORIO.map((h) => {
              const noDisponible = horarioNoDisponible(fecha, h, ocupadosDelDia);
              return (
                <button
                  key={h}
                  type="button"
                  className={`selector-turno-hora ${hora === h ? "selector-turno-hora-elegida" : ""}`}
                  onClick={() => onHora(h)}
                  disabled={noDisponible}
                  aria-pressed={hora === h}
                  aria-label={noDisponible ? `${h}, no disponible` : h}
                >
                  {h}
                </button>
              );
            })}
          </div>
          <p className="selector-turno-ayuda">Los horarios tachados ya están ocupados o pasaron.</p>
        </div>
      )}
    </div>
  );
}
