import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function BuscarPacienteForm() {
    const [busqueda, setBusqueda] = useState('');
    
    const pacientesSimulados = [
        { dni: "12345678", nombre: "Juan", apellido: "Pérez", email: "juan.perez@email.com", telefono: "11-2233-4455" },
        { dni: "87654321", nombre: "María", apellido: "Gómez", email: "maria.gomez@email.com", telefono: "11-9988-7766" },
        { dni: "44556677", nombre: "Lucas", apellido: "Rodríguez", email: "lucas.rod@email.com", telefono: "11-5544-3322" }
    ];

    const pacientesFiltrados = pacientesSimulados.filter(paciente => 
        paciente.dni.includes(busqueda) || 
        paciente.apellido.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <Container className="mt-4">
            <Form className="mb-4 p-4 bg-light rounded shadow-sm">
                <Row className="align-items-end">
                    <Col md={8}>
                        <Form.Group controlId="inputBusqueda">
                            <Form.Label className="fw-bold text-secondary">
                                Buscar por DNI o Apellido
                            </Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Ej: 12345678 o Pérez..." 
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4} className="mt-3 mt-md-0">
                        <Button variant="primary" className="w-100">
                            Buscar
                        </Button>
                    </Col>
                </Row>
            </Form>

            <div className="bg-white rounded shadow-sm p-3">
                <h5 className="text-muted mb-3">
                    Resultados del Sistema
                </h5>
                <Table responsive striped bordered hover className="align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th>DNI</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pacientesFiltrados.length > 0 ? (
                            pacientesFiltrados.map((paciente) => (
                                <tr key={paciente.dni}>
                                    <td className="fw-bold">{paciente.dni}</td>
                                    <td>{paciente.nombre}</td>
                                    <td>{paciente.apellido}</td>
                                    <td>{paciente.email}</td>
                                    <td>{paciente.telefono}</td>
                                    <td className="text-center">
                                        <Button variant="outline-success" size="sm" className="me-2">
                                            Ver Historial
                                        </Button>
                                        <Button variant="outline-warning" size="sm">
                                            Editar
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center text-muted py-4">
                                    No se encontraron pacientes que coincidan con la búsqueda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
        </Container>
    );
}

export default BuscarPacienteForm;