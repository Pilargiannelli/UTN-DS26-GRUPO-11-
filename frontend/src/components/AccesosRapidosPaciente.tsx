import { Link } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import "../assets/styles/AccesosRapidos.css";

const accesos = [
  {
    to: "/pedir-turno",
    titulo: "Agendar una consulta",
    desc: "Especialidad y horario",
    colorClase: "acceso-verde",
    icono: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f6e56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="12" y1="14" x2="12" y2="18" />
        <line x1="10" y1="16" x2="14" y2="16" />
      </svg>
    ),
  },
  {
    to: "/mis-turnos",
    titulo: "Ver mi agenda",
    desc: "Historial y próximas",
    colorClase: "acceso-coral",
    icono: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#993c1d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15 15" />
      </svg>
    ),
  },
  {
    to: "/ver-perfil",
    titulo: "Mis datos",
    desc: "Perfil y obra social",
    colorClase: "acceso-rosa",
    icono: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#993556" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
      </svg>
    ),
  },
];

export function AccesosRapidosPaciente() {
  return (
    <Row className="g-3">
      {accesos.map((a) => (
        <Col md={4} key={a.to}>
          <Link to={a.to} className={`acceso-rapido-card ${a.colorClase}`}>
            <div className="acceso-rapido-icono">{a.icono}</div>
            <p className="acceso-rapido-titulo">{a.titulo}</p>
            <p className="acceso-rapido-desc">{a.desc}</p>
          </Link>
        </Col>
      ))}
    </Row>
  );
}