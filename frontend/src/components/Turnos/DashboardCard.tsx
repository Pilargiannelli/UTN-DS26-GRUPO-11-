import { Card } from "react-bootstrap";
import type { DashboardCardProps } from "../../types/DashboardCardProps";

function DashboardCard({
    titulo,
    numero,
    color,
    icono,
}: DashboardCardProps) {

    return (

        <Card className="dashboard-card h-100">

            <Card.Body>

                <div
                    className="dashboard-icon"
                    style={{ color }}
                >

                    {icono}

                </div>

                <h6>{titulo}</h6>

                <h1>{numero}</h1>

            </Card.Body>

        </Card>

    );

}

export default DashboardCard;