import { Card, Col, Row, Badge } from "react-bootstrap";
import {
  Calendar2Check,
  ClockHistory,
  CheckCircle,
  XCircle,
} from "react-bootstrap-icons";

import "../../assets/styles/DashboardCards.css";

function DashboardCards() {
  const cards = [
    {
      titulo: "Turnos del día",
      numero: 18,
      icono: <Calendar2Check />,
      clase: "verde",
      badge: "HOY",
      porcentaje: "+12%",
    },
    {
      titulo: "Pendientes",
      numero: 3,
      icono: <ClockHistory />,
      clase: "amarillo",
      badge: "ACTIVOS",
      porcentaje: "-2",
    },
    {
      titulo: "Confirmados",
      numero: 12,
      icono: <CheckCircle />,
      clase: "azul",
      badge: "OK",
      porcentaje: "+8%",
    },
    {
      titulo: "Cancelados",
      numero: 3,
      icono: <XCircle />,
      clase: "rojo",
      badge: "ALERTA",
      porcentaje: "+1",
    },
  ];

  return (
    <Row className="g-4 mb-4">
      {cards.map((card) => (
        <Col lg={3} md={6} key={card.titulo}>
          <Card className={`dashboard-card ${card.clase}`}>

            <div className="shine"></div>

            <Card.Body>

              <div className="dashboard-header">

                <Badge className="dashboard-badge">
                  {card.badge}
                </Badge>

                <span className="dashboard-percent">
                  {card.porcentaje}
                </span>

              </div>

              <div className="dashboard-top">

                <div className="dashboard-icon">
                  {card.icono}
                </div>

                <div>

                  <small>{card.titulo}</small>

                  <h2>{card.numero}</h2>

                </div>

              </div>

              <div className="dashboard-chart">

                <div className="bars">

                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>

                </div>

              </div>

            </Card.Body>

          </Card>
        </Col>
      ))}
    </Row>
  );
}

export default DashboardCards;