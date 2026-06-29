// ContadorTurnos.tsx
// Muestra 3 tarjetas con contadores de turnos del día.
// Los valores están en 0 por ahora, listos para conectar a una API o prop en el futuro.
import "../assets/styles/Contador.css"
import type { ContadorTurnosProps } from "../types/ContadorTurnosProps";

export default function ContadorTurnos({
  turnosHoy = 0,
  turnosAtendidos = 0,
  turnosMañana = 0,
}: ContadorTurnosProps) {

  const tarjetas = [
    { id: 1, valor: turnosHoy,       label: "Turnos de hoy",   icono: "📅", color: "#4e9af1" },
    { id: 2, valor: turnosAtendidos, label: "Atendidos",        icono: "✅", color: "#2ecc71" },
    { id: 3, valor: turnosMañana,    label: "Turnos de mañana", icono: "🗓️", color: "#f39c12" },
  ];

  return (
    <div>
      {/* ── Tarjetas en fila ── */}
      <div className="tarjeta-container">
        {tarjetas.map((t) => (
          <div key={t.id} className="tarjeta"
            style={{borderTop: `4px solid ${t.color}`,}} //Falta ver cómo hacer el color variable desde css
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
            }}
          >
            <div className="tarjeta-icono">{t.icono}</div>
            <div className="tarjeta-valor">
              {t.valor}
            </div>
            <div className="tarjeta-label">
              {t.label}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}