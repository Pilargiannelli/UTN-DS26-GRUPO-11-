import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, Button, Container, Form, Spinner } from "react-bootstrap";
import { Eye, Search } from "react-bootstrap-icons";
import Layout from "../components/Layout/Layout.tsx";
import { BotonVolver } from "../components/BotonVolver.tsx";
import { ConsultaModal } from "../components/Medico/ConsultaModal.tsx";
import { Paginador } from "../components/Medico/Paginador.tsx";
import { useHistoriaClinica } from "../hooks/useHistoriaClinica.ts";
import { ETIQUETAS_PERIODO, enRango, normalizarTexto, rangoDePeriodo, type Periodo } from "../utils/periodos.ts";
import type { EntradaClinica } from "../types/HistoriaClinica.ts";
import "../assets/styles/ListadoPaciente.css";

const FILAS_POR_PAGINA = 3;

const FECHA_LARGA = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric" });
const PERIODOS: Periodo[] = ["todo", "semana", "mes", "anio", "personalizado"];

// /pacientes/:id/historial: todas las consultas del paciente (el médico ve la historia completa),
// con filtros por fecha y por texto, de a una página, sin desplazar la pantalla.
function HistorialConsultas() {
  const { id } = useParams();
  const pacienteId = Number(id);
  const { historia, loading, error } =useHistoriaClinica(Number.isInteger(pacienteId) ? pacienteId : null);

  const [periodo, setPeriodo] = useState<Periodo>("todo");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [texto, setTexto] = useState("");
  const [pagina, setPagina] = useState(1);
  const [abierta, setAbierta] = useState<EntradaClinica | null>(null);

  const hayFiltros = periodo !== "todo" || texto.trim() !== "";

  const consultas = useMemo(() => {
    const rango = rangoDePeriodo(periodo, desde, hasta);
    const buscado = normalizarTexto(texto);
    const filtradas = (historia?.entradas ?? []).filter(
      (e) =>
        enRango(e.fecha, rango) &&
        (buscado === "" || normalizarTexto(`${e.diagnostico} ${e.evolucion} ${e.observaciones}`).includes(buscado))
    );
    return filtradas.sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [historia, periodo, desde, hasta, texto]);

  // Cada cambio de filtro vuelve a la primera página
  const cambiar = <T,>(poner: (valor: T) => void) => (valor: T) => {
    poner(valor);
    setPagina(1);
  };

  const limpiar = () => {
    setPeriodo("todo");
    setDesde("");
    setHasta("");
    setTexto("");
    setPagina(1);
  };

  const paginas = Math.max(1, Math.ceil(consultas.length / FILAS_POR_PAGINA));
  const paginaActual = Math.min(pagina, paginas);
  const visibles = consultas.slice((paginaActual - 1) * FILAS_POR_PAGINA, paginaActual * FILAS_POR_PAGINA);
  const nombre = historia ? `${historia.paciente.nombre} ${historia.paciente.apellido}` : "";

  return (
    <Layout>
      <Container className="listado-paciente">
        <BotonVolver destino={`/pacientes/${id}`} />

        <header className="listado-encabezado">
          <div>
            <h1 className="listado-titulo">Historial de consultas</h1>
            <p className="listado-subtitulo">
              {nombre ? <>{nombre} · {historia?.entradas.length ?? 0} consultas registradas</> : "Cargando…"}
            </p>
          </div>
        </header>

        {loading && <div className="text-center py-5"><Spinner animation="border" role="status" aria-label="Cargando historial" /></div>}
        {error && <Alert variant="danger">{error.message}</Alert>}

        {historia && (
          <section className="listado-tarjeta">
            <div className="listado-filtros-fila">
              <div className="listado-busqueda">
                <Search aria-hidden="true" />
                <Form.Control
                  type="search"
                  aria-label="Buscar en las consultas"
                  placeholder="Buscar en título, evolución u observaciones"
                  value={texto}
                  onChange={(e) => cambiar(setTexto)(e.target.value)}
                />
              </div>
              <Form.Select aria-label="Período" value={periodo} onChange={(e) => cambiar(setPeriodo)(e.target.value as Periodo)}>
                {PERIODOS.map((p) => <option key={p} value={p}>{p === "todo" ? "Todo el historial" : ETIQUETAS_PERIODO[p]}</option>)}
              </Form.Select>
              {periodo === "personalizado" && (
                <>
                  <Form.Group controlId="filtro-desde" className="listado-fecha-campo">
                    <Form.Label>Desde</Form.Label>
                    <Form.Control type="date" value={desde} max={hasta || undefined} onChange={(e) => cambiar(setDesde)(e.target.value)} />
                  </Form.Group>
                  <Form.Group controlId="filtro-hasta" className="listado-fecha-campo">
                    <Form.Label>Hasta</Form.Label>
                    <Form.Control type="date" value={hasta} min={desde || undefined} onChange={(e) => cambiar(setHasta)(e.target.value)} />
                  </Form.Group>
                </>
              )}
              {hayFiltros && <Button variant="link" className="listado-limpiar" onClick={limpiar}>Limpiar filtros</Button>}
            </div>

            {consultas.length === 0 ? (
              <p className="listado-vacio">
                {historia.entradas.length === 0 ? "Sin consultas registradas." : "No hay consultas que coincidan con los filtros."}
              </p>
            ) : (
              <ol className="consultas-lista">
                {visibles.map((e) => (
                  <li key={e.id} className="hist-consulta">
                    <p className="hist-consulta-fecha">
                      {FECHA_LARGA.format(new Date(e.fecha))}
                      {historia.medicoResponsable && <> · {historia.medicoResponsable}</>}
                    </p>
                    <div className="hist-consulta-cuerpo">
                      <div className="hist-consulta-texto">
                        <p className="hist-consulta-titulo">{e.diagnostico}</p>
                        <p className="hist-consulta-linea"><strong>Evolución:</strong> {e.evolucion}</p>
                        {e.observaciones && <p className="hist-consulta-linea"><strong>Observaciones:</strong> {e.observaciones}</p>}
                      </div>
                      <Button variant="outline-primary" size="sm" onClick={() => setAbierta(e)} aria-label={`Ver la consulta del ${FECHA_LARGA.format(new Date(e.fecha))}`}>
                        <Eye aria-hidden="true" />Ver
                      </Button>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            <Paginador pagina={paginaActual} tamanio={FILAS_POR_PAGINA} total={consultas.length} onCambiar={setPagina} />
          </section>
        )}
      </Container>

      {abierta && <ConsultaModal entrada={abierta} onCerrar={() => setAbierta(null)} />}
    </Layout>
  );
}

export default HistorialConsultas;
