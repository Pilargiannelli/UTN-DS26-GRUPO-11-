import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import type { TurnoReservadoProps } from '../types/TurnoReservadoProps';
import '../assets/styles/Tabla.css'

function ListaReservados() {
    // Datos de prueba (Mock data) para que la tabla no aparezca vacía
    const turnos: TurnoReservadoProps[] = [
        { id: 1, paciente: "Juan Pérez", especialidad: "Cardiología", medico: "Dr. Rossi", fecha: "02/06/2026", hora: "09:00", estado: "Confirmado" },
        { id: 2, paciente: "María Lopez", especialidad: "Pediatría", medico: "Dra. Gomez", fecha: "02/06/2026", hora: "10:30", estado: "Pendiente" },
        { id: 3, paciente: "Carlos Estévez", especialidad: "Traumatología", medico: "Dr. Fernandez", fecha: "03/06/2026", hora: "11:15", estado: "Cancelado" },
        { id: 4, paciente: "Ana Benítez", especialidad: "Dermatología", medico: "Dra. Vignolo", fecha: "05/06/2026", hora: "16:00", estado: "Confirmado" }
    ];

    // Función para darle los colores de Bootstrap a las etiquetas de estado
    const obtenerColorBadge = (estado: string) => {
        switch (estado) {
            case 'Confirmado': return 'success'; // Verde
            case 'Pendiente': return 'warning';  // Amarillo
            case 'Cancelado': return 'danger';   // Rojo
            default: return 'secondary';
        }
    };

    return (
        <div className="mt-4">
            <h3 className="mb-3 text-secondary fw-bold">Lista de Turnos Reservados</h3>
            
            {/* Tabla responsiva de react-bootstrap con estilos */}
            <Table responsive striped bordered hover className="shadow-sm bg-white rounded">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Paciente</th>
                        <th>Especialidad</th>
                        <th>Médico</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Estado</th>
                        <th className="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {turnos.map((turno) => (
                        <tr key={turno.id}>
                            <td>{turno.id}</td>
                            <td className="fw-semibold">{turno.paciente}</td>
                            <td>{turno.especialidad}</td>
                            <td>{turno.medico}</td>
                            <td>{turno.fecha}</td>
                            <td>{turno.hora} hs</td>
                            <td>
                                <Badge bg={obtenerColorBadge(turno.estado)}>
                                    {turno.estado}
                                </Badge>
                            </td>
                            <td className="text-center">
                                <Button variant="outline-primary" size="sm" className="me-2">
                                    Ver Detalle
                                </Button>
                                {turno.estado !== 'Cancelado' && (
                                    <Button variant="outline-danger" size="sm">
                                        Cancelar
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default ListaReservados;