import { useState } from "react";
import { Container } from "react-bootstrap";
import { useHistorialMedico } from "../hooks/useHistorialMedico";
import { ConsultaCard } from "../components/ConsultaCard";
import Layout from "../components/Layout/Layout";
import "../assets/styles/HistorialClinico.css";

export default function HistorialClinico() {
  const { pacientes, cargando } = useHistorialMedico();
  const [filtro, setFiltro] = useState("");
  // Por defecto todos los pacientes están expandidos (undefined = expandido)
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});

  const pacientesFiltrados = filtro.trim()
    ? pacientes.filter((p) =>
        p.username.toLowerCase().includes(filtro.trim().toLowerCase())
      )
    : pacientes;

  const toggleExpandido = (username: string) => {
    setExpandidos((prev) => ({ ...prev, [username]: !isExpandido(username) }));
  };

  // undefined → expandido por defecto; false → contraído
  const isExpandido = (username: string) => expandidos[username] !== false;

  return (
    <Layout>
      <Container className="py-4">
        {/* Título */}
        <h2 className="histcli-titulo mb-3">Historial Clínico</h2>

        {/* Buscador por nombre de usuario */}
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

        {/* Estado de carga */}
        {cargando && (
          <p className="histcli-estado">Cargando historial...</p>
        )}

        {/* Estado vacío */}
        {!cargando && pacientesFiltrados.length === 0 && (
          <p className="histcli-estado">
            {filtro
              ? `Sin resultados para "@${filtro}"`
              : "No hay consultas registradas."}
          </p>
        )}

        {/* Un bloque por paciente */}
        {pacientesFiltrados.map((paciente) => {
          const abierto = isExpandido(paciente.username);
          const consultasOrdenadas = [...paciente.consultas].sort(
            (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          );

          return (
            <div key={paciente.username} className="histcli-paciente">
              {/* Cabecera colapsable */}
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

              {/* Consultas */}
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
