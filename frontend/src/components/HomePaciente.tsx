import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";
import {
  CalendarCheck, CalendarPlus, ChevronRight, Clock, CreditCard2Front, PersonVcard,
} from "react-bootstrap-icons";
import { useAuth } from "../hooks/useAuth";
import { useTurnosPaciente } from "../hooks/useTurnosPaciente";
import { useMiHistoria } from "../hooks/useMiHistoria";
import { ProximoTurnoCard } from "./ProximoTurnoCard";
import { IndicacionesMedico } from "./Paciente/IndicacionesMedico";
import { parseFechaHora } from "../utils/fecha";
import { saludoSegunHora } from "../utils/saludo";
import "../assets/styles/InicioPaciente.css";

const FECHA_HOY = new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long" });
const FECHA_CONSULTA = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric" });

// Los mismos nombres que el menú, para que se reconozcan
const ACCESOS = [
  { to: "/pedir-turno", titulo: "Pedir turno", desc: "Elegí especialidad, profesional y horario", icono: <CalendarPlus /> },
  { to: "/mis-turnos", titulo: "Mis turnos", desc: "Próximos turnos e indicaciones de cada consulta", icono: <CalendarCheck /> },
  { to: "/buscar-medico", titulo: "Médicos", desc: "Profesionales del consultorio", icono: <PersonVcard /> },
];

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

  const capital = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

  return (
    <Container className="inicio-paciente">
      {/* ── Saludo y próximo turno ── */}
      <section className="inicio-hero">
        <div className="inicio-hero-saludo">
          <p className="inicio-hero-fecha">{capital(FECHA_HOY.format(ahora))}</p>
          <h1 className="inicio-hero-titulo">{saludoSegunHora()}, {usuario?.nombre}</h1>
          <p className="inicio-hero-texto">
            {proximoTurno ? "Este es tu próximo turno." : "No tenés turnos agendados por ahora."}
          </p>
        </div>
        <div className="inicio-hero-turno">
          <ProximoTurnoCard turno={proximoTurno} />
        </div>
      </section>

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

      {/* ── Accesos ── */}
      <nav className="inicio-accesos" aria-label="Accesos rápidos">
        {ACCESOS.map((a) => (
          <Link key={a.to} to={a.to} className="inicio-acceso">
            <span className="inicio-acceso-icono" aria-hidden="true">{a.icono}</span>
            <span className="inicio-acceso-texto">
              <span className="inicio-acceso-titulo">{a.titulo}</span>
              <span className="inicio-acceso-desc">{a.desc}</span>
            </span>
            <ChevronRight aria-hidden="true" className="inicio-acceso-flecha" />
          </Link>
        ))}
      </nav>
    </Container>
  );
}
