import { Card, Col, Row } from "react-bootstrap";
import {
  Calendar2Check,
  ClockHistory,
  CheckCircle,
  XCircle,
} from "react-bootstrap-icons";

import "../../assets/styles/DashboardCards.css";

interface DashboardCardsProps {
  total: number;
  pendientes: number;
  confirmados: number;
  cancelados: number;
}

function DashboardCards({
  total,
  pendientes,
  confirmados,
  cancelados,
}: DashboardCardsProps) {

  const cards = [
    {
      titulo: "Turnos del día",
      numero: total,
      icono: <Calendar2Check />,
      clase: "verde",
    },
    {
      titulo: "Pendientes",
      numero: pendientes,
      icono: <ClockHistory />,
      clase: "amarillo",
    },
    {
      titulo: "Confirmados",
      numero: confirmados,
      icono: <CheckCircle />,
      clase: "azul",
    },
    {
      titulo: "Cancelados",
      numero: cancelados,
      icono: <XCircle />,
      clase: "rojo",
    },
  ];

  return (
    <Row className="g-4 mb-4">

      {cards.map((card) => (

        <Col
          xs={6}
          lg={3}
          md={6}
          key={card.titulo}
        >

          <Card className={`dashboard-card ${card.clase}`}>

            <div className="shine"></div>

            <Card.Body>

              <div className="dashboard-top">

                <div className="dashboard-icon">
                  {card.icono}
                </div>

                <div>

                  <small>
                    {card.titulo}
                  </small>

                  <h2>
                    {card.numero}
                  </h2>

                </div>

              </div>

              <div className="dashboard-chart">

                <div className="line"></div>

              </div>

            </Card.Body>

          </Card>

        </Col>

      ))}

    </Row>
  );
}

export default DashboardCards;