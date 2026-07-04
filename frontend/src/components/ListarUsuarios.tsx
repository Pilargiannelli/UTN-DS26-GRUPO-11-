import { useFetch } from "../hooks/useFetch";
import { useFotoPerfil } from "../hooks/useFotoPerfil";
import { type Usuario } from "../types/Usuario";
import { Container, Row, Col, Card, Button, Spinner, Form} from "react-bootstrap";
import { Search } from "lucide-react";
import '../assets/styles/ListarUsuarios.css';
import { useState } from "react";
import { useUsuarioSeleccionado } from "../hooks/useUsuarioSeleccionado";
import { useNavigate } from "react-router-dom";

interface ListarUsuariosProps {
    rol: "paciente" | "medico";
}

export function ListarUsuarios({ rol }: ListarUsuariosProps) {
    const { data: usuarios, loading, error } = useFetch<Usuario[]>("/users.json");
    const [busqueda, setBusqueda] = useState("");
    const navigate = useNavigate();
    const { seleccionarUsuario } = useUsuarioSeleccionado();
    if (loading) return <Spinner animation="border" />
    if (error) {
        return (
            <div className="text-center my-5 text-danger">
                <p>Hubo un error al cargar los usuarios.</p>
            </div>
        );
    }
    const usuariosPorRol = usuarios ? usuarios.filter((u) => u.rol === rol) : [];
    const usuariosFiltrados = usuariosPorRol.filter((usuario) => {
        const nombreCompleto = `${usuario.docs.nombre} ${usuario.docs.apellido}`.toLowerCase();
        const dni = usuario.docs.dni.toLowerCase();
        const termino = busqueda.toLowerCase().trim();
        const esNumerico = /^\d+$/.test(termino);
        if (esNumerico) {
            return dni.startsWith(termino);
        }
        return nombreCompleto.includes(termino);
    });
    const handleVerPerfil = (usuario: Usuario) => {
        seleccionarUsuario(usuario);
        navigate("/ver-perfil");
    };
    return (
        <Container className="my-4">
            <div className="buscador-fila mb-4">
                <div className="buscador-spacer" aria-hidden="true" />
                <div className="position-relative buscador-container">
                    <Search className="buscador-icono" size={18} aria-hidden="true" />
                    <Form.Control type="text" placeholder={`Buscar ${rol === "paciente" ? "paciente" : "médico"} por nombre o DNI`} value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="ps-5 pe-5" />
                    {busqueda && ( <button type="button" className="btn-limpiar" onClick={() => setBusqueda("")} aria-label="Limpiar búsqueda" > &times; </button> )}
                </div>
                {rol === "paciente" ? (
                    <button
                        type="button"
                        className="btn-nuevo-paciente"
                        onClick={() => navigate("/registrar-paciente")}
                    >
                        + Crear nuevo paciente
                    </button>
                ) : (
                    <div />
                )}
            </div>
            {usuariosFiltrados.length === 0 ? (
                <div className="text-center my-5 text-muted bg-light p-5 rounded shadow-sm">
                    <p className="m-0">No se encontraron resultados para "<strong>{busqueda}</strong>".</p>
                </div>
            ) : (
                <Row>
                    {usuariosFiltrados.map((usuario) => {
                        // eslint-disable-next-line react-hooks/rules-of-hooks
                        const estilosFoto = useFotoPerfil(usuario.foto);
                        const datosPersonales = usuario.docs;
                        const nombreCompleto = `${datosPersonales.nombre} ${datosPersonales.apellido}`;
                        return (
                            <Col key={usuario.u} xs={12} sm={6} md={4} lg={3} className="mb-4">
                                <Card className="h-100 shadow-sm text-center border-0 p-3 user-card">
                                    <div className="d-flex justify-content-center my-3">
                                        <div {...estilosFoto} aria-label={`Foto de ${nombreCompleto}`} />
                                    </div>
                                    <Card.Body className="d-flex flex-column justify-content-between">
                                        <div>
                                            <Card.Title className="fs-5 mb-1 nombre">{nombreCompleto}</Card.Title>
                                            <Card.Text className="text-muted small">
                                                {usuario.rol === "medico" ? ( <span>{usuario.docs.especialidad}</span> ) : ( <span>@{usuario.u}</span> )}
                                            </Card.Text>
                                        </div>
                                        <Button variant="primary" className="mt-3 w-100 btn-custom" onClick={() => handleVerPerfil(usuario)}> Ver Perfil </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}
        </Container>
    );
}