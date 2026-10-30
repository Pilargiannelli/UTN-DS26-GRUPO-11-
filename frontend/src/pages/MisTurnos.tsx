import { useSearchParams, Link } from "react-router-dom";
import { Alert, Container, Spinner, Tab, Tabs } from "react-bootstrap";
import { CalendarCheck } from "react-bootstrap-icons";
import Layout from "../components/Layout/Layout.tsx";
import { EncabezadoPagina } from "../components/EncabezadoPagina";
import { TurnoPacienteCard } from "../components/Paciente/TurnoPacienteCard";
import { IndicacionesMedico } from "../components/Paciente/IndicacionesMedico";
import { useTurnosPaciente } from "../hooks/useTurnosPaciente";
import { consultaDelTurno, useMiHistoria } from "../hooks/useMiHistoria";
import { parseFechaHora } from "../utils/fecha";
import { useToast } from "../hooks/useToast";
import { ToastMensaje } from "../components/NotifyToast";
import type { EntradaClinica } from "../types/HistoriaClinica";
import type { Turno } from "../types/Turno";
import "../assets/styles/PacienteTurnos.css";

type Seccion = "proximos" | "historial";

const FECHA_CONSULTA = new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

// En el historial van los turnos pasados (con lo que indicó el médico) y las
// consultas que el médico registró sin turno de por medio
type ItemHistorial =
  | { tipo: "turno"; fecha: number; turno: Turno; consulta?: EntradaClinica }
  | { tipo: "consulta"; fecha: number; consulta: EntradaClinica };

function MisTurnos() {
  const { misTurnos, loading, error } = useTurnosPaciente();
  const { historia } = useMiHistoria();
  const [params, setParams] = useSearchParams();
  const seccion: Seccion = params.get("ver") === "historial" ? "historial" : "proximos";
  // Vienen en el state de navigate() desde PedirTurno y CancelarTurno
  const creado = useToast("turnoCreado");
  const cancelado = useToast("turnoCancelado");

  const ahora = new Date();
  const entradas = historia?.entradas ?? [];

  const proximos = misTurnos
    .filter((t) => t.estado !== "Cancelado" && parseFechaHora(t.fechaHora) >= ahora)
    .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));

  const pasados = misTurnos.filter((t) => t.estado === "Cancelado" || parseFechaHora(t.fechaHora) < ahora);
  const usadas = new Set<number>();
  const historial: ItemHistorial[] = pasados.map((turno) => {
    const consulta = consultaDelTurno(turno, entradas);
    if (consulta) usadas.add(consulta.id);
    return { tipo: "turno", fecha: parseFechaHora(turno.fechaHora).getTime(), turno, consulta };
  });
  entradas
    .filter((e) => !usadas.has(e.id))
    .forEach((consulta) => historial.push({ tipo: "consulta", fecha: new Date(consulta.fecha).getTime(), consulta }));
  historial.sort((a, b) => b.fecha - a.fecha);

  const porConfirmar = proximos.filter((t) => t.estado !== "Confirmado").length;

  return (
    <Layout>
      <ToastMensaje
        mensaje="Turno solicitado. Queda pendiente hasta que el consultorio lo confirme."
        tipo="toast-good"
        mostrar={creado.showToast}
        onClose={() => creado.setShowToast(false)}
      />
      <ToastMensaje
        mensaje="Turno cancelado."
        tipo="toast-good"
        mostrar={cancelado.showToast}
        onClose={() => cancelado.setShowToast(false)}
      />

      <Container className="mis-turnos-pagina">
        <EncabezadoPagina
          titulo="Mis turnos"
          etiqueta="Mi salud"
          icono={<CalendarCheck />}
          descripcion="Tus próximos turnos y, en el historial, lo que te indicó el médico en cada consulta."
          datos={loading || error ? undefined : [
            { valor: proximos.length, texto: proximos.length === 1 ? "Próximo turno" : "Próximos turnos" },
            { valor: porConfirmar, texto: "Por confirmar" },
            { valor: entradas.length, texto: entradas.length === 1 ? "Consulta registrada" : "Consultas registradas" },
          ]}
          accion={<Link to="/pedir-turno" className="btn btn-primary">+ Pedir turno</Link>}
        />

        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" aria-label="Cargando turnos" />
          </div>
        )}
        {error && <Alert variant="danger">{error.message}</Alert>}

        {!loading && !error && (
          <Tabs
            activeKey={seccion}
            onSelect={(k) => setParams(k === "historial" ? { ver: "historial" } : {}, { replace: true })}
            className="mis-turnos-tabs"
            id="mis-turnos-secciones"
            mountOnEnter
            unmountOnExit
            transition={false}
          >
            <Tab eventKey="proximos" title={`Próximos (${proximos.length})`}>
              {proximos.length === 0 ? (
                <div className="mis-turnos-vacio">
                  <p>No tenés turnos agendados.</p>
                  <Link to="/pedir-turno" className="btn btn-primary">Pedir un turno</Link>
                </div>
              ) : (
                proximos.map((t) => <TurnoPacienteCard key={t.id} turno={t} />)
              )}
            </Tab>

            <Tab eventKey="historial" title={`Historial (${historial.length})`}>
              {historia && historia.alergias.length > 0 && (
                <div className="mis-turnos-alergias">
                  <strong>Alergias registradas:</strong> {historia.alergias.join(", ")}
                </div>
              )}
              {historial.length === 0 ? (
                <div className="mis-turnos-vacio">
                  <p>Todavía no tenés consultas anteriores.</p>
                </div>
              ) : (
                historial.map((item) =>
                  item.tipo === "turno" ? (
                    <TurnoPacienteCard key={`t${item.turno.id}`} turno={item.turno} consulta={item.consulta} />
                  ) : (
                    <article key={`c${item.consulta.id}`} className="turno-paciente turno-paciente-atendido">
                      <div className="turno-paciente-fila">
                        <div className="turno-paciente-info">
                          <h3 className="turno-paciente-titulo">
                            Consulta del {FECHA_CONSULTA.format(new Date(item.consulta.fecha))}
                          </h3>
                          {historia?.medicoResponsable && (
                            <p className="turno-paciente-medico">Con {historia.medicoResponsable}</p>
                          )}
                        </div>
                        <span className="turno-paciente-estado turno-paciente-estado-atendido">Atendido</span>
                      </div>
                      <IndicacionesMedico consulta={item.consulta} />
                    </article>
                  )
                )
              )}
            </Tab>
          </Tabs>
        )}

        {seccion === "proximos" && !loading && !error && porConfirmar > 0 && (
          <p className="turno-paciente-nota mt-2">
            Los turnos por confirmar se pueden cancelar desde acá. Una vez confirmados, si no podés ir avisá al consultorio.
          </p>
        )}
      </Container>
    </Layout>
  );
}

export default MisTurnos;
