import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import imosLogo from "../assets/img/IMOS_LOGO.png";
import "../assets/styles/Landing.css";

// Landing pública (ruta "/"): presenta el sistema de turnos de la clínica IMOS.
// Cada enlace del menú apunta al id de su sección (scroll suave en Landing.css).
const SECCIONES = [
  { id: "servicios", etiqueta: "Servicios" },
  { id: "como-funciona", etiqueta: "Cómo funciona" },
  { id: "perfiles", etiqueta: "Para quién" },
  { id: "preguntas", etiqueta: "Preguntas" },
  { id: "contacto", etiqueta: "Contacto" },
];

const SERVICIOS = [
  {
    titulo: "Pedí tu turno online",
    texto:
      "Elegí especialidad, profesional, día y horario en tres pasos, sin llamar ni ir a la clínica.",
  },
  {
    titulo: "Mis turnos",
    texto:
      "Consultá tus turnos próximos y pasados, con el detalle de cada uno y su estado.",
  },
  {
    titulo: "Cancelá cuando lo necesites",
    texto:
      "Si no podés asistir, cancelás el turno desde el sistema y el horario queda libre para otro paciente.",
  },
  {
    titulo: "Buscá a tu profesional",
    texto:
      "Encontrá al médico por nombre o especialidad y mirá su perfil antes de reservar.",
  },
  {
    titulo: "Historia clínica",
    texto:
      "Cada consulta queda registrada en la ficha del paciente: datos, turnos y evolución en un solo lugar.",
  },
  {
    titulo: "Agenda del día",
    texto:
      "El equipo médico y la secretaría ven la agenda ordenada y los turnos confirmados de cada jornada.",
  },
];

const PASOS = [
  {
    titulo: "Creá tu cuenta",
    texto: "Registrate con tus datos personales. Solo se hace una vez.",
  },
  {
    titulo: "Elegí tu turno",
    texto: "Seleccioná especialidad, profesional y un horario disponible.",
  },
  {
    titulo: "Asistí a la consulta",
    texto: "Llegá a la clínica en el día y hora elegidos. Tu turno queda en Mis turnos.",
  },
];

const PERFILES = [
  {
    rol: "Pacientes",
    items: [
      "Pedir, ver y cancelar turnos",
      "Buscar profesionales",
      "Consultar tus datos y tu cuenta",
    ],
  },
  {
    rol: "Médicos",
    items: [
      "Agenda y orden del día",
      "Búsqueda y ficha de pacientes",
      "Historia clínica de cada consulta",
    ],
  },
  {
    rol: "Secretaría",
    items: [
      "Alta y edición de pacientes",
      "Gestión de turnos de la clínica",
      "Agenda de cada médico",
    ],
  },
];

const PREGUNTAS = [
  {
    p: "¿Necesito una cuenta para sacar un turno?",
    r: "Sí. Podés crearla vos mismo desde “Crear cuenta”, o pedir en la secretaría que te registren.",
  },
  {
    p: "¿Puedo cancelar un turno?",
    r: "Sí, desde “Mis turnos” elegís el turno y lo cancelás. El horario vuelve a quedar disponible.",
  },
  {
    p: "¿Qué hago si olvidé mi contraseña?",
    r: "Comunicate con la secretaría de la clínica y te ayudan a recuperar el acceso.",
  },
  {
    p: "¿Quién ve mi información médica?",
    r: "Solo el personal autorizado de la clínica. Cada rol accede únicamente a lo que necesita para su trabajo.",
  },
];

export default function Landing() {
  const { estaAutenticado } = useAuth();

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <a className="landing-nav-brand" href="#inicio" aria-label="IMOS, ir al inicio">
          <img src={imosLogo} alt="IMOS" />
        </a>

        <nav className="landing-nav-links" aria-label="Secciones">
          {SECCIONES.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {s.etiqueta}
            </a>
          ))}
        </nav>

        <div className="landing-nav-actions">
          {estaAutenticado ? (
            <Link className="landing-btn landing-btn-primary" to="/home">
              Ir a mi panel
            </Link>
          ) : (
            <>
              <Link className="landing-btn landing-btn-ghost" to="/crear-cuenta">
                Crear cuenta
              </Link>
              <Link className="landing-btn landing-btn-primary" to="/login">
                Ingresar
              </Link>
            </>
          )}
        </div>
      </header>

      <main>
        <section id="inicio" className="landing-hero">
          <div className="landing-hero-overlay" aria-hidden="true" />
          <div className="landing-hero-contenido">
            <span className="landing-eyebrow">Clínica IMOS Saladillo · Traumatología</span>
            <h1>Tus turnos médicos, simples y en un solo lugar</h1>
            <p>
              Pedí, consultá y cancelá turnos online. La clínica gestiona pacientes,
              agenda e historia clínica con un sistema pensado para reducir ausencias y
              desorden.
            </p>
            <div className="landing-hero-acciones">
              <Link
                className="landing-btn landing-btn-light landing-btn-lg"
                to={estaAutenticado ? "/pedir-turno" : "/crear-cuenta"}
              >
                {estaAutenticado ? "Pedir turno" : "Crear cuenta"}
              </Link>
              <a className="landing-btn landing-btn-contorno-claro landing-btn-lg" href="#como-funciona">
                Cómo funciona
              </a>
            </div>
          </div>
        </section>

        <section id="servicios" className="landing-seccion">
          <h2>Qué podés hacer</h2>
          <p className="landing-seccion-sub">
            Todo lo que necesitás para tu atención, sin trámites ni esperas.
          </p>
          <div className="landing-grid landing-grid-3">
            {SERVICIOS.map((s) => (
              <article key={s.titulo} className="landing-card">
                <h3>{s.titulo}</h3>
                <p>{s.texto}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="como-funciona" className="landing-seccion landing-seccion-suave">
          <h2>Cómo funciona</h2>
          <p className="landing-seccion-sub">Tres pasos para reservar tu consulta.</p>
          <ol className="landing-pasos">
            {PASOS.map((paso, i) => (
              <li key={paso.titulo} className="landing-card landing-paso">
                <span className="landing-paso-num">{i + 1}</span>
                <h3>{paso.titulo}</h3>
                <p>{paso.texto}</p>
              </li>
            ))}
          </ol>
          <div className="landing-centro">
            <Link className="landing-btn landing-btn-primary landing-btn-lg" to="/crear-cuenta">
              Empezar ahora
            </Link>
          </div>
        </section>

        <section id="perfiles" className="landing-seccion">
          <h2>Un sistema para todo el equipo</h2>
          <p className="landing-seccion-sub">
            Cada persona ve solo las herramientas que necesita.
          </p>
          <div className="landing-grid landing-grid-3">
            {PERFILES.map((perfil) => (
              <article key={perfil.rol} className="landing-card">
                <h3>{perfil.rol}</h3>
                <ul className="landing-lista">
                  {perfil.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="preguntas" className="landing-seccion landing-seccion-suave">
          <h2>Preguntas frecuentes</h2>
          <div className="landing-faq">
            {PREGUNTAS.map((q) => (
              <details key={q.p} className="landing-card">
                <summary>{q.p}</summary>
                <p>{q.r}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="contacto" className="landing-cta">
          <h2>¿Listo para sacar tu turno?</h2>
          <p>
            Ingresá a tu cuenta o creá una nueva. Si necesitás ayuda, comunicate con la
            secretaría de la clínica.
          </p>
          <div className="landing-hero-acciones landing-centro">
            <Link className="landing-btn landing-btn-light landing-btn-lg" to="/login">
              Ingresar
            </Link>
            <Link className="landing-btn landing-btn-contorno-claro landing-btn-lg" to="/crear-cuenta">
              Crear cuenta
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} Clínica IMOS Saladillo</span>
        <nav aria-label="Secciones del pie">
          {SECCIONES.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {s.etiqueta}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  );
}
