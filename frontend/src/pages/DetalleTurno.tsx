import { Link, useParams } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import {
  Calendar3, CheckLg, Clock, CreditCard2Front, InfoCircle, XLg,
} from "react-bootstrap-icons";
import Layout from "../components/Layout/Layout.tsx";
import { Migas } from "../components/Migas.tsx";
import { AvatarIniciales } from "../components/AvatarIniciales";
import { IndicacionesMedico } from "../components/Paciente/IndicacionesMedico";
import { consultaDelTurno, useMiHistoria } from "../hooks/useMiHistoria";
import { useFetch } from "../hooks/useFetch";
import { useAuth } from "../hooks/useAuth";
import { formatearChipFecha, formatearHora } from "../utils/fecha";
import { estadoVisible, puedeCancelarPaciente, yaPaso } from "../utils/estadoTurno";
import type { Turno } from "../types/Turno";
import "../assets/styles/PacienteTurnos.css";
import "../assets/styles/DetalleTurno.css";

const FECHA_LARGA = new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const capital = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

// Detalle de un turno del paciente: en qué etapa está, los datos de la cita,
// lo que indicó el médico (si ya se atendió) y qué tiene que hacer ahora
function DetalleTurno() {
  const { id } = useParams();
  const { usuario } = useAuth();
  // GET /api/turnos/:id: el back devuelve 404 si el turno no existe o no es tuyo
  const { data: turno, loading, error } = useFetch<Turno>(`/turnos/${id}`);
  const { historia } = useMiHistoria();

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-5">
          <Spinner animation="border" role="status" aria-label="Cargando turno" />
        </div>
      </Layout>
    );
  }

  if (error || !turno) {
    return (
      <Layout>
        <Container className="detalle-turno">
          <Migas items={[{ texto: "Mis turnos", a: "/mis-turnos" }, { texto: "Turno" }]} />
          <div className="mis-turnos-vacio">
            <p>No encontramos este turno.</p>
            <Link to="/mis-turnos" className="btn btn-outline-secondary">Ir a Mis turnos</Link>
          </div>
        </Container>
      </Layout>
    );
  }

  const { dia, mes } = formatearChipFecha(turno.fechaHora);
  const pasado = yaPaso(turno.fechaHora);
  const consulta = pasado ? consultaDelTurno(turno, historia?.entradas ?? []) : undefined;
  const estado = estadoVisible(turno, consulta);
  const cancelado = turno.estado === "Cancelado";
  const medico = turno.medico;
  const nombreMedico = `${medico.usuario.nombre} ${medico.usuario.apellido}`;
  const cobertura = usuario?.paciente?.coberturas?.[0];

  // Etapas del turno: solicitado → confirmado → atendido (o cancelado)
  const pasos = cancelado
    ? [{ texto: "Solicitado", hecho: true }, { texto: "Cancelado", hecho: true, error: true }]
    : [
        { texto: "Solicitado", hecho: true },
        { texto: "Confirmado", hecho: turno.estado === "Confirmado" || !!consulta },
        { texto: "Atendido", hecho: !!consulta },
      ];

  return (
    <Layout>
      <Container className="detalle-turno">
        <Migas items={[{ texto: "Mis turnos", a: "/mis-turnos" }, { texto: `Turno del ${dia} de ${mes.toLowerCase()}` }]} />

        <div className="detalle-turno-layout">
          <div className="detalle-turno-principal">
            {/* ── Encabezado ── */}
            <section className={`detalle-turno-card detalle-turno-cabecera turno-paciente-${estado.clase}`}>
              <div className="turno-paciente-fecha" aria-hidden="true">
                <span className="turno-paciente-mes">{mes}</span>
                <span className="turno-paciente-dia">{dia}</span>
              </div>
              <div className="detalle-turno-cabecera-texto">
                <p className="detalle-turno-etiqueta">Turno de {medico.especialidad.toLowerCase()}</p>
                <h1 className="detalle-turno-titulo">
                  {capital(FECHA_LARGA.format(new Date(turno.fechaHora)))}, {formatearHora(turno.fechaHora)} h
                </h1>
              </div>
              <span className={`turno-paciente-estado turno-paciente-estado-${estado.clase}`}>{estado.texto}</span>
            </section>

            {/* ── Etapas ── */}
            <ol className="detalle-turno-pasos" aria-label="Estado del turno">
              {pasos.map((p) => (
                <li
                  key={p.texto}
                  className={`detalle-turno-paso${p.hecho ? " detalle-turno-paso-hecho" : ""}${"error" in p ? " detalle-turno-paso-error" : ""}`}
                >
                  <span className="detalle-turno-paso-marca" aria-hidden="true">
                    {"error" in p ? <XLg /> : p.hecho ? <CheckLg /> : null}
                  </span>
                  <span className="detalle-turno-paso-texto">{p.texto}</span>
                </li>
              ))}
            </ol>

            {/* ── Datos ── */}
            <section className="detalle-turno-card">
              <h2 className="detalle-turno-subtitulo">Datos del turno</h2>
              <div className="detalle-turno-profesional">
                <AvatarIniciales nombre={medico.usuario.nombre} apellido={medico.usuario.apellido} id={medico.id} tamanio="lg" />
                <div>
                  <p className="detalle-turno-profesional-nombre">{nombreMedico}</p>
                  <p className="detalle-turno-profesional-detalle">{medico.especialidad} · Mat. {medico.matricula}</p>
                </div>
              </div>
              <dl className="detalle-turno-datos">
                <div>
                  <dt><Calendar3 aria-hidden="true" /> Fecha</dt>
                  <dd>{capital(FECHA_LARGA.format(new Date(turno.fechaHora)))}</dd>
                </div>
                <div>
                  <dt><Clock aria-hidden="true" /> Horario</dt>
                  <dd>{formatearHora(turno.fechaHora)} h · 30 minutos</dd>
                </div>
                <div>
                  <dt><CreditCard2Front aria-hidden="true" /> Cobertura</dt>
                  <dd>{cobertura ? `${cobertura.obraSocial.nombre} · Plan ${cobertura.plan}` : "Particular"}</dd>
                </div>
              </dl>
            </section>

            {consulta && (
              <section className="detalle-turno-card">
                <h2 className="detalle-turno-subtitulo">Resultado de la consulta</h2>
                <IndicacionesMedico consulta={consulta} />
              </section>
            )}
          </div>

          {/* ── Qué sigue ── */}
          <aside className="detalle-turno-card detalle-turno-sigue" aria-label="Qué sigue">
            <h2 className="detalle-turno-subtitulo">
              <InfoCircle aria-hidden="true" className="detalle-turno-sigue-icono" />Qué sigue
            </h2>

            {cancelado ? (
              <>
                <p>Este turno fue cancelado. Si todavía necesitás la consulta, pedí uno nuevo.</p>
                <Link to={`/pedir-turno?medico=${medico.id}`} className="btn btn-primary w-100">
                  Pedir nuevo turno
                </Link>
              </>
            ) : pasado ? (
              <>
                <p>
                  {consulta
                    ? "Seguí las indicaciones del médico. Si te pidió un control, podés pedir el turno ahora."
                    : "Este turno ya pasó. Si necesitás volver a consultar, pedí un turno nuevo."}
                </p>
                <Link to={`/pedir-turno?medico=${medico.id}`} className="btn btn-primary w-100">
                  Pedir turno con {medico.usuario.nombre}
                </Link>
              </>
            ) : turno.estado === "Confirmado" ? (
              <>
                <p>Tu turno está confirmado. Te esperamos.</p>
                <ul className="detalle-turno-recordatorios">
                  <li>Llegá 10 minutos antes.</li>
                  <li>Traé tu DNI{cobertura ? " y la credencial de tu obra social" : ""}.</li>
                  <li>Si no podés ir, avisá al consultorio: un turno confirmado no se cancela desde la app.</li>
                </ul>
              </>
            ) : (
              <>
                <p>
                  El consultorio todavía tiene que confirmar tu turno. Mientras esté por confirmar lo podés cancelar.
                </p>
                {/* RN-006: el paciente cancela solo antes de la confirmación */}
                {puedeCancelarPaciente(turno.estado, turno.fechaHora) && (
                  <Link to={`/turnos/${turno.id}/cancelar`} className="btn btn-outline-danger w-100">
                    Cancelar turno
                  </Link>
                )}
              </>
            )}

            <Link to="/mis-turnos" className="detalle-turno-volver">Ver todos mis turnos</Link>
          </aside>
        </div>
      </Container>
    </Layout>
  );
}

export default DetalleTurno;
