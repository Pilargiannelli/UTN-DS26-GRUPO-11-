import "../../assets/styles/Hero.css";
import type { HeroTurnosProps } from "../../types/HeroTurnosProps";

function HeroTurnos({
  secretaria,
  proximoPaciente,
  especialidad,
  fecha,
  hora,
}: HeroTurnosProps) {
  return (
    <div className="hero">

      <div className="hero-left">

        <span className="hero-role">
          SECRETARÍA MÉDICA
        </span>

        <h1>
          👋 Buenos días, {secretaria}
        </h1>

        <p>
          Administrá la agenda médica, confirmaciones,
          cancelaciones y reprogramaciones desde un único panel.
        </p>

      </div>

      <div className="hero-right">

        <div className="hero-item">

          <span>👤 Próximo turno</span>

          <strong>{proximoPaciente}</strong>

          <small>
            {hora} hs · {especialidad}
          </small>

        </div>

        <div className="hero-item">

          <span>📅 Hoy</span>

          <strong>{fecha}</strong>

          <small>2026</small>

        </div>

        <div className="hero-item">

          <span>🕒 Hora</span>

          <strong>{hora}</strong>

          <small className="status">
            ● Sistema activo
          </small>

        </div>

      </div>

    </div>
  );
}

export default HeroTurnos;