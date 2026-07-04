import {
  Badge,
  Button,
  Card,
  Table,
} from "react-bootstrap";

import {
  PencilSquare,
  CalendarEvent,
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

function obtenerIniciales(nombre: string) {
  return nombre
    .split(" ")
    .map((p) => p[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function TurnosTable({
  turnos,
}: TurnosTableProps) {

  return (

    <Card className="agenda-card">

      <Card.Body>

        <div className="agenda-header">

          <div>

            <h2>Agenda Médica</h2>

            <p>
              Turnos programados para hoy
            </p>

          </div>

        </div>

        <Table
          responsive
          hover
          className="agenda-table align-middle"
        >

          <thead>

            <tr>

              <th>Hora</th>

              <th>Paciente</th>

              <th>Médico</th>

              <th>Especialidad</th>

              <th>Fecha</th>

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

                <td>

                  <span className="hora">
                    {turno.hora}
                  </span>

                </td>

                <td>

                  <div className="paciente">

                    <div className="avatar">

                      {obtenerIniciales(turno.paciente)}

                    </div>

                    <div>

                      <strong>
                        {turno.paciente}
                      </strong>

                    </div>

                  </div>

                </td>

                <td>

                  {turno.medico}

                </td>

                <td>

                  <span className="texto-gris">

                    {turno.especialidad}

                  </span>

                </td>

                <td>

                  {turno.fecha}

                </td>

                <td>

                  {turno.obraSocial}

                </td>

                <td>

                  <Badge
                    bg={obtenerColorEstado(turno.estado)}
                  >
                    {turno.estado}
                  </Badge>

                </td>

                <td>

                  <div className="acciones">

                    <Button
                      variant="light"
                      title="Editar"
                    >

                      <PencilSquare />

                    </Button>

                    <Button
                      variant="light"
                      title="Reprogramar"
                    >

                      <CalendarEvent />

                    </Button>

                    <Button
                      variant="light"
                      title="Cancelar"
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