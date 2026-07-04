import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout/Layout.tsx";
import { BotonVolver } from "../components/BotonVolver.tsx";
import { useTurnosPaciente } from "../hooks/useTurnosPaciente";
import "../assets/styles/CancelarTurno.css";
import "../assets/styles/PaginaPaciente.css";

function CancelarTurno() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { misTurnos } = useTurnosPaciente();
  const [motivo, setMotivo] = useState("");

  const turno = misTurnos.find((t) => t.id === Number(id));

  if (!turno) {
    return (
      <Layout>
        <div className="pagina-paciente">
          <BotonVolver />
          <p className="text-muted">No se encontró el turno.</p>
        </div>
      </Layout>
    );
  }

  const confirmarCancelacion = () => {
    // Acá va la llamada real a la API cuando exista (PATCH turno -> estado Cancelado).
    navigate("/mis-turnos");
  };

  return (
    <Layout>
      <div className="pagina-paciente">
        <BotonVolver />

        <div className="cancelar-turno-overlay">
          <div className="cancelar-turno-card">
            <div className="cancelar-turno-encabezado">
              <div className="cancelar-turno-icono">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#993c1d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <line x1="9" y1="14" x2="15" y2="18" />
                  <line x1="15" y1="14" x2="9" y2="18" />
                </svg>
              </div>
              <p className="cancelar-turno-titulo">Cancelar consulta</p>
            </div>

            <p className="cancelar-turno-texto">
              Vas a liberar el turno de {turno.especialidad} del {turno.fecha} a las {turno.hora} con {turno.medico}.
            </p>

            <label className="cancelar-turno-label">Motivo (opcional)</label>
            <textarea
              className="cancelar-turno-textarea"
              placeholder="Contanos por qué cancelás"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />

            <div className="cancelar-turno-acciones">
              <button className="cancelar-turno-btn-volver" onClick={() => navigate(`/turnos/${turno.id}`)}>Volver</button>
              <button className="cancelar-turno-btn-confirmar" onClick={confirmarCancelacion}>Confirmar</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default CancelarTurno;