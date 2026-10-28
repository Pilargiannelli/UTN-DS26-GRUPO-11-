import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import Layout from "../components/Layout/Layout";
import { ConsultaCard } from "../components/ConsultaCard";
import { NuevaEntradaForm } from "../components/NuevaEntradaForm";
import { useFetch } from "../hooks/useFetch";
import { useHistoriaClinica } from "../hooks/useHistoriaClinica";
import type { PacienteTurno } from "../types/Turno";
import "../assets/styles/HistorialClinico.css";

const sinAcentos = (texto: string) => texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Historia clínica (solo MEDICO, la ruta ya lo restringe y el back responde
// 403 a la secretaria). El médico elige un paciente, ve sus consultas de la
// más nueva a la más vieja (HU-005) y registra una nueva (HU-004).
// ?paciente=<id> abre directamente la historia de ese paciente.
export default function HistorialClinico() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pacienteId = Number(searchParams.get("paciente")) || null;
  const [filtro, setFiltro] = useState("");

  const { data: pacientes, loading: cargandoPacientes, error: errorPacientes } = useFetch<PacienteTurno[]>("/pacientes");
  const { historia, loading, error, agregarEntrada } = useHistoriaClinica(pacienteId);

  const texto = sinAcentos(filtro.trim());
  const pacientesFiltrados = (pacientes ?? []).filter((p) =>
    !texto ||
    sinAcentos(`${p.usuario.nombre} ${p.usuario.apellido}`).includes(texto) ||
    (p.usuario.dni ?? "").startsWith(texto)
  );

  return (
    <Layout>
      <Container className="py-4">
        <h2 className="histcli-titulo mb-3">Historia clínica</h2>

        <Row className="g-4">
          {/* Lista de pacientes */}
          <Col md={4}>
            <label htmlFor="histcli-buscar" className="visually-hidden">Buscar paciente</label>
            <input
              id="histcli-buscar"
              className="histcli-search mb-3"
              placeholder="Buscar por nombre o DNI..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />

            {cargandoPacientes && <Spinner animation="border" size="sm" />}
            {errorPacientes && <Alert variant="danger">{errorPacientes.message}</Alert>}
            {!cargandoPacientes && pacientesFiltrados.length === 0 && (
              <p className="histcli-estado">No hay pacientes que coincidan.</p>
            )}

            <div className="histcli-lista">
              {pacientesFiltrados.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`histcli-paciente-header ${p.id === pacienteId ? "histcli-paciente-activo" : ""}`}
                  onClick={() => setSearchParams({ paciente: String(p.id) })}
                  aria-current={p.id === pacienteId ? "true" : undefined}
                >
                  <span>
                    <span className="histcli-paciente-nombre d-block">{p.usuario.apellido}, {p.usuario.nombre}</span>
                    {p.usuario.dni && <span className="histcli-paciente-user d-block">DNI {p.usuario.dni}</span>}
                  </span>
                </button>
              ))}
            </div>
          </Col>

          {/* Historia del paciente elegido */}
          <Col md={8}>
            {!pacienteId && (
              <p className="histcli-estado">Elegí un paciente para ver su historia clínica.</p>
            )}
            {loading && <Spinner animation="border" role="status" aria-label="Cargando historia" />}
            {error && <Alert variant="danger">{error.message}</Alert>}

            {historia && !loading && (
              <>
                <div className="histcli-cabecera">
                  <h3 className="histcli-subtitulo m-0">{historia.paciente.nombre} {historia.paciente.apellido}</h3>
                  <span className="histcli-paciente-user">DNI {historia.paciente.dni}</span>
                </div>

                <div className="histcli-listas">
                  <div>
                    <h4 className="histcli-etiqueta">Alergias</h4>
                    {historia.alergias.length > 0
                      ? historia.alergias.map((a) => <span key={a} className="histcli-chip">{a}</span>)
                      : <span className="histcli-estado">Sin alergias registradas</span>}
                  </div>
                  <div>
                    <h4 className="histcli-etiqueta">Antecedentes</h4>
                    {historia.antecedentes.length > 0
                      ? historia.antecedentes.map((a) => <span key={a} className="histcli-chip">{a}</span>)
                      : <span className="histcli-estado">Sin antecedentes registrados</span>}
                  </div>
                </div>

                <Row className="g-4">
                  <Col lg={7}>
                    <h3 className="histcli-subtitulo">Consultas</h3>
                    {historia.entradas.length === 0 ? (
                      <p className="histcli-estado">Todavía no hay consultas registradas.</p>
                    ) : (
                      <div className="histcli-consultas">
                        {historia.entradas.map((e) => (
                          <ConsultaCard key={e.id} entrada={e} medico={historia.medicoResponsable} />
                        ))}
                      </div>
                    )}
                  </Col>
                  <Col lg={5}>
                    <NuevaEntradaForm onGuardar={agregarEntrada} />
                  </Col>
                </Row>
              </>
            )}
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}
