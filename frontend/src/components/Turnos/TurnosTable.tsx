import {
  Badge,
  Card,
  Table,
  Button,
} from "react-bootstrap";

import {
  Eye,
  Pencil,
  ArrowRepeat,
  Trash,
} from "react-bootstrap-icons";

import type { TurnosTableProps } from "../../types/TurnosTableProps";

import "../../assets/styles/TurnosTable.css";

function obtenerColorEstado(estado: string) {
  switch (estado) {
    case "Pendiente":
      return "warning";
    case "Confirmado":
      return "success";
    case "Cancelado":
      return "danger";
    default:
      return "secondary";
  }
}

function TurnosTable({ turnos }: TurnosTableProps) {
  return (
    <Card className="agenda-card">

      <Card.Body>

        <div className="agenda-header">

          <div>

            <h2>Agenda médica</h2>

            <p>Viernes 3 de Julio · {turnos.length} turnos</p>

          </div>

        </div>

        <Table responsive borderless className="agenda-table">

          <thead>

            <tr>

              <th>Hora</th>

              <th>Paciente</th>

              <th>Médico</th>

              <th>Obra Social</th>

              <th>Estado</th>

              <th className="text-center">
                Acciones
              </th>

            </tr>

          </thead>

          <tbody>

            {turnos.map((turno) => (

              <tr key={turno.id}>

                <td className="hora">
                  {turno.hora}
                </td>

                <td>

                  <div className="paciente">

                    <div className="avatar">

                      {turno.paciente.charAt(0)}

                    </div>

                    <div>

                      <strong>
                        {turno.paciente}
                      </strong>

                    </div>

                  </div>

                </td>

                <td className="texto-gris">

                  {turno.medico}

                </td>

                <td>{turno.obraSocial}</td>

                <td>

                  <Badge
                    pill
                    bg={obtenerColorEstado(turno.estado)}
                  >
                    {turno.estado}
                  </Badge>

                </td>

                <td>

                  <div className="acciones">

                    <Button
                      size="sm"
                      variant="light"
                    >
                      <Eye />
                    </Button>

                    <Button
                      size="sm"
                      variant="light"
                    >
                      <Pencil />
                    </Button>

                    <Button
                      size="sm"
                      variant="light"
                    >
                      <ArrowRepeat />
                    </Button>

                    <Button
                      size="sm"
                      variant="light"
                    >
                      <Trash />
                    </Button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </Table>

      </Card.Body>

    </Card>
  );
}

export default TurnosTable;