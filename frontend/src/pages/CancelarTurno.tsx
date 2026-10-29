import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import Layout from "../components/Layout/Layout.tsx";
import { BotonVolver } from "../components/BotonVolver.tsx";
import { useFetch } from "../hooks/useFetch";
import { apiFetch } from "../services/api";
import { formatearChipFecha, formatearHora } from "../utils/fecha";
import type { Turno } from "../types/Turno";
import "../assets/styles/CancelarTurno.css";
import "../assets/styles/PaginaPaciente.css";

function CancelarTurno() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: turno, loading, error } = useFetch<Turno>(`/turnos/${id}`);
  const [cancelando, setCancelando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (loading) {
    return (
      <Layout>
        <div className="pagina-paciente text-center py-5">
          <Spinner animation="border" role="status" aria-label="Cargando turno" />
        </div>
      </Layout>
    );
  }

  if (error || !turno) {
    return (
      <Layout>
        <div className="pagina-paciente">
          <BotonVolver />
          <p className="text-muted">No encontramos este turno.</p>
        </div>
      </Layout>
    );
  }

  const confirmarCancelacion = async () => {
    setCancelando(true);
    setErrorMsg(null);
    try {
      // Cancelar es un cambio de estado: el turno pasa a "Pasadas" como Cancelado
      await apiFetch<Turno>(`/turnos/${turno.id}/cancelar`, { method: "PATCH" });
      navigate("/mis-turnos", { state: { turnoCancelado: true } });
    } catch (err) {
      // 409 si ya fue confirmado: mostramos el mensaje real del back
      setErrorMsg(err instanceof Error ? err.message : "No se pudo cancelar el turno");
      setCancelando(false);
    }
  };

  const { dia, mes } = formatearChipFecha(turno.fechaHora);

  return (
    <Layout>
      <div className="pagina-paciente">
        <BotonVolver />

        <div className="cancelar-turno-overlay">
          <div className="cancelar-turno-card">
            <div className="cancelar-turno-encabezado">
              <div className="cancelar-turno-icono">
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <line x1="9" y1="14" x2="15" y2="18" />
                  <line x1="15" y1="14" x2="9" y2="18" />
                </svg>
              </div>
              <h1 className="cancelar-turno-titulo">Cancelar consulta</h1>
            </div>

            <p className="cancelar-turno-texto">
              Vas a liberar el turno de {turno.medico.especialidad} del {dia} de {mes} a las{" "}
              {formatearHora(turno.fechaHora)} con {turno.medico.usuario.nombre} {turno.medico.usuario.apellido}.
              El turno queda en tu historial como cancelado.
            </p>

            {errorMsg && (
              <div className="cancelar-turno-error" role="alert">{errorMsg}</div>
            )}

            <div className="cancelar-turno-acciones">
              <button className="cancelar-turno-btn-volver" onClick={() => navigate(`/turnos/${turno.id}`)}>Volver</button>
              <button className="cancelar-turno-btn-confirmar" onClick={confirmarCancelacion} disabled={cancelando}>
                {cancelando ? "Cancelando..." : "Confirmar cancelación"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default CancelarTurno;
