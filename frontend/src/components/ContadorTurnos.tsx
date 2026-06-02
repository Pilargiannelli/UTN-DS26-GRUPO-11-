// ContadorTurnos.tsx
// Muestra 3 tarjetas con contadores de turnos del día.
// Los valores están en 0 por ahora, listos para conectar a una API o prop en el futuro.

interface ContadorTurnosProps {
  turnosHoy?: number;
  turnosAtendidos?: number;
  turnosMañana?: number;
}

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
    <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", fontFamily: "sans-serif", padding: "32px 24px" }}>

      {/* ── Barra superior ── */}
      <div style={{
        backgroundColor: "#212529",
        padding: "16px 24px",
        borderRadius: "8px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
      }}>
        <h5 style={{ color: "#fff", margin: 0, fontWeight: 600, fontSize: "1.1rem" }}>
          Resumen del día
        </h5>
      </div>

      {/* ── Tarjetas en fila ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "16px",
        maxWidth: "700px",
      }}>
        {tarjetas.map((t) => (
          <div
            key={t.id}
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "24px 20px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              borderTop: `4px solid ${t.color}`,
              transition: "transform 0.15s, box-shadow 0.15s",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
            }}
          >
            <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>{t.icono}</div>
            <div style={{ fontSize: "2.8rem", fontWeight: 700, color: t.color, lineHeight: 1, marginBottom: "8px" }}>
              {t.valor}
            </div>
            <div style={{ fontSize: "0.85rem", color: "#6c757d", fontWeight: 500 }}>
              {t.label}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}