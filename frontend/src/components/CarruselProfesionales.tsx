import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";

// Recorte de una foto dentro de una imagen compartida: x, y, ancho y alto.
// Por defecto es /profesionales.webp; con hoja: "equipo", es /equipo-medico.webp (la hoja con todo el equipo)
interface RecorteFoto {
  x: number;
  y: number;
  w: number;
  h: number;
  hoja?: "equipo";
}

export interface Profesional {
  nombre: string;
  cargo: string;
  // Recorte de /profesionales.webp o ruta de una imagen propia. Si no se indica, se busca en
  // src/assets/profesionales/<nombre-apellido>.(jpg|png|webp) y, si no hay, se muestra un avatar
  foto?: RecorteFoto | string;
}

const IMAGEN_COMPARTIDA = { ancho: 1095, alto: 672, ruta: "/profesionales.webp" };
const HOJA_EQUIPO = { ancho: 1536, alto: 1024, ruta: "/equipo-medico.webp" };
const SIN_FOTO = "/SinFoto.png";
const ASPECTO_FOTO = "310 / 257";

// Fotos sueltas: se toman solas de src/assets/profesionales (ej. "mariana-agostino.jpg")
const FOTOS_PROPIAS = import.meta.glob("../assets/profesionales/*.{jpg,jpeg,png,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const quitarTildes = (texto: string) => texto.normalize("NFD").replace(/[̀-ͯ]/g, "");
const nombreDeArchivo = (nombre: string) => quitarTildes(nombre).toLowerCase().trim().replace(/\s+/g, "-");

const fotoPropia = (nombre: string) => {
  const clave = Object.keys(FOTOS_PROPIAS).find(
    (ruta) => quitarTildes(ruta.split("/").pop()!.replace(/\.[^.]+$/, "")).toLowerCase() === nombreDeArchivo(nombre)
  );
  return clave ? FOTOS_PROPIAS[clave] : undefined;
};

// Tiempo entre un cambio y el siguiente (ms)
const INTERVALO = 4500;

function estiloFoto(p: Profesional): CSSProperties {
  const foto = p.foto ?? fotoPropia(p.nombre);
  if (foto && typeof foto === "object") {
    const { y } = foto;
    let { x, w, h } = foto;
    const { ancho, alto, ruta } = foto.hoja === "equipo" ? HOJA_EQUIPO : IMAGEN_COMPARTIDA;
    if (foto.hoja === "equipo") {
      // Las fotos de la hoja son más anchas que la tarjeta: se toma el centro, donde está la cara
      const proporcion = 310 / 257;
      if (w > h * proporcion) {
        x += (w - h * proporcion) / 2;
        w = h * proporcion;
      } else {
        h = w / proporcion;
      }
    }
    return {
      backgroundImage: `url(${ruta})`,
      backgroundSize: `${(ancho / w) * 100}% auto`,
      backgroundPosition: `${(x / (ancho - w)) * 100}% ${(y / (alto - h)) * 100}%`,
      aspectRatio: `${w} / ${h}`,
    };
  }
  return {
    backgroundImage: `url(${foto ?? SIN_FOTO})`,
    backgroundSize: "cover",
    backgroundPosition: "center 20%",
    aspectRatio: ASPECTO_FOTO,
  };
}

// Posición de una tarjeta respecto de la del centro, dando la vuelta a la lista (-n/2 .. n/2)
const desplazamiento = (indice: number, centro: number, n: number) => {
  const d = (((indice - centro) % n) + n) % n;
  return d > n / 2 ? d - n : d;
};

// Carrusel en 3D: la tarjeta del centro al frente y las vecinas inclinadas a los costados, para ver
// cuál viene. Avanza solo cada tanto; las tarjetas se mueven hacia la derecha (sentido antihorario).
export function CarruselProfesionales({ profesionales }: { profesionales: Profesional[] }) {
  const n = profesionales.length;
  const [centro, setCentro] = useState(0);
  const [pausado, setPausado] = useState(false);

  // d = -1: las tarjetas se mueven a la derecha (entra una nueva por la izquierda); d = 1: a la izquierda
  const mover = useCallback((d: 1 | -1) => setCentro((c) => (c + d + n) % n), [n]);

  useEffect(() => {
    if (pausado) return;
    const id = window.setInterval(() => {
      if (!document.hidden) mover(-1);
    }, INTERVALO);
    return () => window.clearInterval(id);
  }, [pausado, mover]);

  return (
    <div
      className="landing-carrusel"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Profesionales"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={(e) => e.target.matches(":focus-visible") && setPausado(true)}
      onBlur={() => setPausado(false)}
    >
      <button type="button" className="landing-carrusel-flecha anterior" aria-label="Profesional anterior" onClick={() => mover(-1)}>
        <ChevronLeft aria-hidden="true" />
      </button>

      <div className="landing-carrusel-escena">
        {profesionales.map((p, i) => {
          const k = desplazamiento(i, centro, n);
          const lejos = Math.abs(k);
          const estilo: CSSProperties = {
            ...estiloVista(k),
            transition: lejos > 3 ? "none" : undefined,
          };
          return (
            <article
              key={p.nombre}
              className={`landing-prof-card landing-carrusel-tarjeta${k === 0 ? " central" : ""}`}
              style={estilo}
              aria-hidden={lejos > 0 ? true : undefined}
              onClick={lejos === 1 ? () => mover(k < 0 ? -1 : 1) : undefined}
            >
              <div className="landing-prof-foto" role="img" aria-label={p.nombre} style={estiloFoto(p)} />
              <div className="landing-prof-info">
                <h3>{p.nombre}</h3>
                <p>{p.cargo}</p>
                <span className="landing-prof-linea" aria-hidden="true" />
              </div>
            </article>
          );
        })}
      </div>

      <button type="button" className="landing-carrusel-flecha siguiente" aria-label="Profesional siguiente" onClick={() => mover(1)}>
        <ChevronRight aria-hidden="true" />
      </button>
    </div>
  );
}

// Posición, giro, tamaño y brillo de la tarjeta según su lugar (0 = centro, ±1 vecinas rectas, ±2 inclinadas)
function estiloVista(k: number): CSSProperties {
  const lejos = Math.abs(k);
  // Las vecinas de la del centro van rectas; solo las de los extremos se inclinan
  const x = lejos <= 1 ? k * 64 : Math.sign(k) * 134;
  const giro = lejos <= 1 ? 0 : k > 0 ? -34 : 34;
  return {
    transform: `translateX(${x}%) translateZ(${-lejos * 140}px) rotateY(${giro}deg) scale(${1 - lejos * 0.08})`,
    opacity: lejos > 2 ? 0 : 1 - lejos * 0.22,
    zIndex: 10 - lejos,
    filter: lejos === 0 ? "none" : `brightness(${1 - lejos * 0.07}) saturate(.92)`,
    visibility: lejos > 2 ? "hidden" : "visible",
    pointerEvents: lejos === 1 ? "auto" : lejos === 0 ? "auto" : "none",
  };
}
