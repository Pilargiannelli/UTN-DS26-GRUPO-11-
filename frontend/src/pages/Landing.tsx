import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Clock, GeoAlt, Person } from "react-bootstrap-icons";
import { useAuth } from "../hooks/useAuth";
import { IconoEspecialidad } from "../components/IconoEspecialidad";
import { CarruselProfesionales, type Profesional } from "../components/CarruselProfesionales";
import imosLogo from "../assets/img/IMOS_LOGO.png";
import "../assets/styles/Landing.css";

// Landing pública (ruta "/"): presenta el sistema de turnos de la clínica IMOS.
// Cada enlace del menú apunta al id de su sección (scroll suave en Landing.css).
const SECCIONES = [
  { id: "inicio", etiqueta: "Inicio" },
  { id: "especialidades", etiqueta: "Especialidades" },
  { id: "profesionales", etiqueta: "Profesionales" },
  { id: "contacto", etiqueta: "Contacto" },
];

const ESPECIALIDADES = [
  "Nutrición",
  "Cardiología",
  "Cirugía",
  "Otorrinolaringología",
  "Ecografías",
  "Traumatología",
  "Odontología",
  "Ortodoncia y Ortopedia",
  "Oftalmología",
  "Psiquiatría",
  "Ginecología",
  "Reumatología",
  "Pediatría",
  "Fonoaudiología",
  "Medicina General",
];

// Las fotos están en una sola hoja (/equipo-medico.webp, 1536 x 1024 px): columnas [x, ancho] y filas [y, alto]
const COLUMNAS = [[60, 269], [356, 264], [646, 263], [935, 260], [1222, 254]];
const FILAS = [[14, 154], [274, 146], [534, 144], [785, 143]];
const deHoja = (columna: number, fila: number) => ({
  hoja: "equipo" as const,
  x: COLUMNAS[columna][0],
  w: COLUMNAS[columna][1],
  y: FILAS[fila][0],
  h: FILAS[fila][1],
});

// Profesionales del carrusel. Para sumar una foto: guardar la imagen en frontend/public/profesionales/
// y agregar foto: "/profesionales/nombre.jpg". Sin foto se muestra un avatar genérico.
// (Hoy las fotos salen de la hoja /equipo-medico.webp; Castellani, de /profesionales.webp.)
const PROFESIONALES: Profesional[] = [
  { nombre: "Mariana Agostino", cargo: "Nutricionista", foto: deHoja(0, 0) },
  { nombre: "Raúl Almada", cargo: "Cardiología", foto: deHoja(1, 0) },
  { nombre: "Alejandro Armendariz", cargo: "Médico Cirujano", foto: deHoja(2, 0) },
  { nombre: "Facundo Bertoni", cargo: "Otorrinolaringología", foto: deHoja(3, 0) },
  { nombre: "Sandra Casalino", cargo: "Ecografías", foto: deHoja(4, 0) },
  { nombre: "Mauricio Castellani", cargo: "Traumatología", foto: { x: 56, y: 189, w: 310, h: 257 } },
  { nombre: "Diego Cordero", cargo: "Cardiología", foto: deHoja(0, 1) },
  { nombre: "Adriana Croce", cargo: "Odontología (Ortodoncia y Ortopedia)", foto: deHoja(1, 1) },
  { nombre: "Betina Garat", cargo: "Ecografías", foto: deHoja(2, 1) },
  { nombre: "Verónica Giustozzi", cargo: "Oftalmología", foto: deHoja(3, 1) },
  { nombre: "Gabriel López", cargo: "Psiquiatría", foto: deHoja(4, 1) },
  { nombre: "Alejandra Lorden", cargo: "Ginecología", foto: deHoja(0, 2) },
  { nombre: "Luisina Mengarelli", cargo: "Odontología", foto: deHoja(1, 2) },
  { nombre: "Marcelo Mengarelli", cargo: "Odontología", foto: deHoja(2, 2) },
  { nombre: "Fara Nauan", cargo: "Reumatología", foto: deHoja(3, 2) },
  { nombre: "Alejandro Piñeyro", cargo: "Ginecología", foto: deHoja(4, 2) },
  { nombre: "Marianela Piñeyro", cargo: "Pediatría", foto: deHoja(0, 3) },
  { nombre: "Martina Tiberi", cargo: "Fonoaudiología", foto: deHoja(1, 3) },
  { nombre: "Guillermo Trofino", cargo: "Medicina General", foto: deHoja(2, 3) },
];

export default function Landing() {
  const { estaAutenticado, rol } = useAuth();
  const [activa, setActiva] = useState("inicio");

  const irAlInicio = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.history.pushState(null, "", "#inicio");
  };

  // Sección en la que se está parado: queda marcada en la barra
  useEffect(() => {
    const ids = SECCIONES.map((s) => s.id);
    const actualizar = () => {
      let actual = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) actual = id;
      }
      // Al final de la página, la última sección aunque no llegue a la marca
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        actual = ids[ids.length - 1];
      }
      setActiva(actual);
    };
    window.addEventListener("scroll", actualizar, { passive: true });
    actualizar();
    return () => window.removeEventListener("scroll", actualizar);
  }, []);

  // La página es plana: nada debe quedar escalado ni traslúcido en los bloques
  useEffect(() => {
    document.querySelectorAll<HTMLElement>(".landing-bloque").forEach((bloque) => {
      bloque.style.removeProperty("transform");
      bloque.style.removeProperty("opacity");
    });
  }, []);

  // Las secciones aparecen con un desvanecimiento corto al llegar a la pantalla
  useEffect(() => {
    const pagina = document.querySelector<HTMLElement>(".landing-page");
    // Los fondos de las secciones quedan fijos: lo que aparece es su contenido
    const bloques = Array.from(document.querySelectorAll<HTMLElement>(".landing-bloque > section > *"));
    const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!pagina || sinMovimiento || !("IntersectionObserver" in window)) return;

    pagina.classList.add("con-reveal");
    bloques.forEach((bloque) => bloque.classList.add("landing-revelar"));
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          const yaPasado = !entrada.isIntersecting && entrada.boundingClientRect.top < 0;
          if (!entrada.isIntersecting && !yaPasado) return;
          // Si ya quedó arriba (salto de ancla, recarga a mitad de página) se muestra sin animar
          if (yaPasado) entrada.target.classList.add("instantaneo");
          entrada.target.classList.add("visible");
          observador.unobserve(entrada.target);
        });
      },
      { threshold: 0.12 }
    );
    bloques.forEach((bloque) => observador.observe(bloque));

    return () => {
      observador.disconnect();
      pagina.classList.remove("con-reveal");
      bloques.forEach((bloque) => bloque.classList.remove("landing-revelar", "visible", "instantaneo"));
    };
  }, []);

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <a className="landing-nav-brand" href="#inicio" aria-label="IMOS, ir al inicio" onClick={irAlInicio}>
          <img src={imosLogo} alt="IMOS" />
        </a>

        <nav className="landing-nav-links" aria-label="Secciones">
          {SECCIONES.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={activa === s.id ? "activo" : undefined}
              aria-current={activa === s.id ? "location" : undefined}
              onClick={s.id === "inicio" ? irAlInicio : undefined}
            >
              {s.etiqueta}
            </a>
          ))}
        </nav>

        <div className="landing-nav-actions">
          {!estaAutenticado && (
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
            <span className="landing-eyebrow">Clínica IMOS Saladillo</span>
            <h1>La confianza de sentirte cuidado</h1>
            <p>
              En IMOS creemos en una atención médica cercana, humana y profesional. Un
              espacio donde tu salud y bienestar son siempre lo más importante. Gestioná
              tus turnos online de forma rápida y sencilla, desde donde estés.
            </p>
            <div className="landing-hero-acciones">
              {!estaAutenticado && (
                <Link className="landing-btn landing-btn-light landing-btn-lg" to="/crear-cuenta">
                  Agendar turno
                </Link>
              )}
              {estaAutenticado && rol === "PACIENTE" && (
                <>
                  <Link className="landing-btn landing-btn-light landing-btn-lg" to="/pedir-turno">
                    Agendar turno
                  </Link>
                  <Link className="landing-btn landing-btn-contorno-claro landing-btn-lg" to="/home">
                    Ingresar al portal
                  </Link>
                </>
              )}
              {estaAutenticado && rol !== "PACIENTE" && (
                <Link className="landing-btn landing-btn-light landing-btn-lg" to="/home">
                  Ir a mi panel
                </Link>
              )}
            </div>
          </div>
        </section>

        <div className="landing-bloque">
          <section id="especialidades" className="landing-seccion landing-seccion-servicios landing-especialidades">
            <h2 className="landing-esp-titulo"><span>Nuestras especialidades</span></h2>
            <ul className="landing-esp-grid">
              {ESPECIALIDADES.map((e) => (
                <li key={e} className="landing-esp-card">
                  <span className="landing-esp-icono"><IconoEspecialidad nombre={e} /></span>
                  <span className="landing-esp-nombre">{e}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="landing-bloque">
          <section id="profesionales" className="landing-seccion landing-profesionales">
            <h2 className="landing-prof-titulo"><span>Nuestros profesionales</span></h2>
            <CarruselProfesionales profesionales={PROFESIONALES} />
          </section>
        </div>

        <div className="landing-bloque">
          <section id="contacto" className="landing-info">
            <div className="landing-info-item">
              <span className="landing-info-icono" aria-hidden="true"><GeoAlt /></span>
              <div>
                <h3>Dirección</h3>
                <p>Almafuerte 3157, Saladillo, Buenos Aires</p>
              </div>
            </div>
            <div className="landing-info-item">
              <span className="landing-info-icono" aria-hidden="true"><Clock /></span>
              <div>
                <h3>Horario de atención</h3>
                <p>Lunes a viernes de 8.00 a 12.00 y de 16.00 a 20.00 hs</p>
              </div>
            </div>
            <div className="landing-info-item">
              <span className="landing-info-icono" aria-hidden="true"><Person /></span>
              <div>
                <h3>Contacto</h3>
                <p>02344 43-1919</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} Clínica IMOS Saladillo</span>
      </footer>
    </div>
  );
}
