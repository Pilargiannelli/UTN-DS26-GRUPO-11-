import "../../assets/styles/Hero.css";
import type { HeroTurnosProps } from "../../types/HeroTurnosProps";
import { formatearHora } from "../../utils/fecha";
import { saludoSegunHora } from "../../utils/saludo";

const plural = (n: number, singular: string, varios: string) => `${n} ${n === 1 ? singular : varios}`;

// Encabezado del panel de turnos (secretaria y médico): el resumen del día en
// una línea, en vez de tarjetas que repetían los contadores de las pestañas
function HeroTurnos({
  rol,
  nombre,
  fecha,
  turnosDeHoy,
  pendientes,
  proximoTurno,
}: HeroTurnosProps) {
  const fechaProximo = proximoTurno
    ? new Date(proximoTurno.fechaHora).toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" })
    : null;

  return (
    <div className="hero">

      <div className="hero-left">

        <span className="hero-role">
          {rol === "MEDICO" ? "Consultorio" : "Secretaría"}
        </span>

        <h1>
          {saludoSegunHora()}, {nombre}
        </h1>

        <p className="hero-fecha">{fecha}</p>

        {/* Lo que pide acción (pendientes) va resaltado */}
        <p className="hero-resumen">
          Hoy: <strong>{plural(turnosDeHoy, "turno", "turnos")}</strong>
          {" · "}
          {pendientes > 0 ? (
            <span className="hero-resumen-pendientes">
              {plural(pendientes, "pendiente", "pendientes")} de confirmar
            </span>
          ) : (
            "sin pendientes de confirmar"
          )}
        </p>

      </div>

      <div className="hero-right">

        <div className="hero-item">

          <span>Próximo turno</span>

          {proximoTurno ? (
            <>
              <strong>
                {proximoTurno.paciente.usuario.nombre} {proximoTurno.paciente.usuario.apellido}
              </strong>
              <small>
                {fechaProximo} · {formatearHora(proximoTurno.fechaHora)} hs · {proximoTurno.medico.especialidad}
              </small>
            </>
          ) : (
            <strong>Sin turnos próximos</strong>
          )}

        </div>

      </div>

    </div>
  );
}

export default HeroTurnos;
