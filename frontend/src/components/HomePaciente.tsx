import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";
import {
  Calendar3, CalendarEvent, ChevronRight, Clock, CreditCard2Front,
} from "react-bootstrap-icons";
import { useAuth } from "../hooks/useAuth";
import { useTurnosPaciente } from "../hooks/useTurnosPaciente";
import { useMiHistoria } from "../hooks/useMiHistoria";
import { ProximoTurnoCard } from "./ProximoTurnoCard";
import { IndicacionesMedico } from "./Paciente/IndicacionesMedico";
import { parseFechaHora } from "../utils/fecha";
import { saludoSegunHora } from "../utils/saludo";
import "../assets/styles/InicioPaciente.css";
import "../assets/styles/PacienteTheme.css";

const FECHA_HOY = new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long" });
const FECHA_CONSULTA = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric" });

// Inicio del paciente: su próximo turno, un resumen, lo último que le indicó
// el médico, su cobertura y los datos del consultorio
export function HomePaciente() {
  const { usuario } = useAuth();
  const { misTurnos, proximoTurno } = useTurnosPaciente();
  const { historia } = useMiHistoria();

  const ahora = new Date();
  const proximos = misTurnos.filter((t) => t.estado !== "Cancelado" && parseFechaHora(t.fechaHora) >= ahora);
  const porConfirmar = proximos.filter((t) => t.estado !== "Confirmado").length;
  const ultimaConsulta = historia?.entradas[0];
  const cobertura = usuario?.paciente?.coberturas?.[0];

  return (
    <Container className="inicio-paciente">
      {/* ── Saludo y próximo turno ── */}
      <header className="recepcion-bienvenida">
        <div className="recepcion-intro">
          <span className="recepcion-etiqueta">Paciente · Inicio</span>
          <h1>{saludoSegunHora()}, <span className="recepcion-nombre">{usuario?.nombre}</span></h1>
          <p className="recepcion-fecha"><CalendarEvent aria-hidden="true" /><span>{FECHA_HOY.format(ahora)}</span></p>
          <Link to="/mis-turnos" className="recepcion-resumen">
            <Calendar3 aria-hidden="true" />
            <strong>{proximos.length}</strong> {proximos.length === 1 ? "turno próximo" : "turnos próximos"}<ChevronRight aria-hidden="true" />
          </Link>
        </div>
        <div className="recepcion-accesos inicio-hero-turno">
          <ProximoTurnoCard turno={proximoTurno} />
        </div>
      </header>

      {/* ── Resumen ── */}
      <dl className="inicio-resumen">
        <div className="inicio-resumen-item">
          <dt>Próximos turnos</dt>
          <dd>{proximos.length}</dd>
        </div>
        <div className="inicio-resumen-item">
          <dt>Por confirmar</dt>
          <dd>{porConfirmar}</dd>
        </div>
        <div className="inicio-resumen-item">
          <dt>Última consulta</dt>
          <dd className="inicio-resumen-texto">
            {ultimaConsulta ? FECHA_CONSULTA.format(new Date(ultimaConsulta.fecha)) : "Sin consultas"}
          </dd>
        </div>
      </dl>

      <div className="inicio-columnas">
        {/* ── Última indicación ── */}
        <section className="inicio-tarjeta">
          <div className="inicio-tarjeta-encabezado">
            <h2 className="inicio-tarjeta-titulo">Tu última consulta</h2>
            {ultimaConsulta && (
              <Link to="/mis-turnos?ver=historial" className="inicio-link">
                Ver historial <ChevronRight aria-hidden="true" />
              </Link>
            )}
          </div>
          {ultimaConsulta ? (
            <>
              <p className="inicio-tarjeta-sub">
                {FECHA_CONSULTA.format(new Date(ultimaConsulta.fecha))}
                {historia?.medicoResponsable && <> · {historia.medicoResponsable}</>}
              </p>
              <IndicacionesMedico consulta={ultimaConsulta} />
            </>
          ) : (
            <p className="inicio-vacio">
              Cuando te atiendas, acá vas a ver el diagnóstico y las indicaciones que te dejó el médico.
            </p>
          )}
        </section>

        <div className="inicio-lateral">
          {/* ── Cobertura ── */}
          <section className="inicio-tarjeta">
            <h2 className="inicio-tarjeta-titulo">
              <CreditCard2Front aria-hidden="true" className="inicio-tarjeta-icono" />Tu cobertura
            </h2>
            {cobertura ? (
              <dl className="inicio-datos">
                <div><dt>Obra social</dt><dd>{cobertura.obraSocial.nombre}</dd></div>
                <div><dt>Plan</dt><dd>{cobertura.plan}</dd></div>
                <div><dt>N.º de afiliado</dt><dd>{cobertura.nroAfiliado}</dd></div>
              </dl>
            ) : (
              <p className="inicio-vacio">Te atendés como particular. Si tenés obra social, avisá en recepción.</p>
            )}
          </section>

          {/* ── Consultorio ── */}
          <section className="inicio-tarjeta">
            <h2 className="inicio-tarjeta-titulo">
              <Clock aria-hidden="true" className="inicio-tarjeta-icono" />Horarios de atención
            </h2>
            <p className="inicio-horario">Lunes a viernes, de 8 a 20 h</p>
            <p className="inicio-vacio">
              Llegá 10 minutos antes con tu DNI{cobertura ? " y la credencial de tu obra social" : ""}.
            </p>
          </section>
        </div>
      </div>
    </Container>
  );
}
