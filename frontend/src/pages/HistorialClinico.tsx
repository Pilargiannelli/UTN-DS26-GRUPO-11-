import { useState } from "react";
import { Container } from "react-bootstrap";
import { useHistorialMedico } from "../hooks/useHistorialMedico";
import { ConsultaCard } from "../components/ConsultaCard";
import Layout from "../components/Layout/Layout";
import { useAuth } from "../hooks/useAuth";
import "../assets/styles/HistorialClinico.css";

export default function HistorialClinico() {
  const { tieneRol } = useAuth();
  const { pacientes, cargando } = useHistorialMedico();
  const [filtro, setFiltro] = useState("");
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});

  // Secretaria recibe 403 en todo el historial clínico
  if (tieneRol("SECRETARIA")) {
    return (
      <Layout>
        <Container className="py-5 text-center">
          <div className="alert alert-danger" role="alert">
            <h4>Acceso Restringido (403)</h4>
            <p>El personal administrativo no tiene permiso para consultar la historia clínica.</p>
          </div>
        </Container>
      </Layout>
    );
  }

  const pacientesFiltrados = filtro.trim()
    ? pacientes.filter((p) =>
        p.username.toLowerCase().includes(filtro.trim().toLowerCase())
      )
    : pacientes;

  const toggleExpandido = (username: string) => {
    setExpandidos((prev) => ({ ...prev, [username]: !isExpandido(username) }));
  };

  const isExpandido = (username: string) => expandidos[username] !== false;

  return (
    <Layout>
      <Container className="py-4">
        <h2 className="histcli-titulo mb-3">Historial Clínico</h2>

        <div className="histcli-search-wrapper mb-4">
          <span className="histcli-search-icon">🔍</span>
          <input
            className="histcli-search"
            placeholder="Filtrar por usuario del paciente..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
          {filtro && (
            <button
              className="histcli-search-clear"
              onClick={() => setFiltro("")}
              aria-label="Limpiar filtro"
            >
              ✕
            </button>
          )}
        </div>

        {cargando && (
          <p className="histcli-estado">Cargando historial...</p>
        )}

        {!cargando && pacientesFiltrados.length === 0 && (
          <p className="histcli-estado">
            {filtro
              ? `Sin resultados para "@${filtro}"`
              : "No hay consultas registradas."}
          </p>
        )}

        {pacientesFiltrados.map((paciente) => {
          const abierto = isExpandido(paciente.username);
          const consultasOrdenadas = [...paciente.consultas].sort(
            (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          );

          return (
            <div key={paciente.username} className="histcli-paciente">
              <button
                className="histcli-paciente-header"
                onClick={() => toggleExpandido(paciente.username)}
              >
                <div>
                  <p className="histcli-paciente-nombre">
                    {paciente.nombre} {paciente.apellido}
                  </p>
                  <p className="histcli-paciente-user">@{paciente.username}</p>
                </div>
                <div className="d-flex align-items-center">
                  <span className="histcli-badge">
                    {paciente.consultas.length}{" "}
                    {paciente.consultas.length === 1 ? "consulta" : "consultas"}
                  </span>
                  <span className="histcli-chevron">{abierto ? "∧" : "∨"}</span>
                </div>
              </button>

              {abierto && (
                <div className="histcli-consultas">
                  {consultasOrdenadas.map((consulta, i) => (
                    <ConsultaCard key={i} consulta={consulta} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </Container>
    </Layout>
  );
}