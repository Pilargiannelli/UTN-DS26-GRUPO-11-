import { Search } from "react-bootstrap-icons";
import { useFetch } from "../hooks/useFetch";
import { useFotoPerfil } from "../hooks/useFotoPerfil";
import { Container, Row, Col, Card, Button, Spinner, Form} from "react-bootstrap";
import '../assets/styles/ListarUsuarios.css';
import { useState } from "react";
import { useUsuarioSeleccionado } from "../hooks/useUsuarioSeleccionado";
import { useNavigate } from "react-router-dom";
import { BotonAgregar } from "./BotonAgregar";

interface ListarUsuariosProps {
    rol: "paciente" | "medico";
}

const sinAcentos = (texto: string) =>
    texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function ListarUsuarios({ rol }: ListarUsuariosProps) {
    const endpoint = rol === "medico" ? "/medicos" : "/pacientes";
    // Tipamos como any temporalmente o según tu interfaz de Usuario del backend nuevo
    const { data: registros, loading, error } = useFetch<any[]>(endpoint);
    
    const [busqueda, setBusqueda] = useState("");
    const navigate = useNavigate();
    const { seleccionarUsuario } = useUsuarioSeleccionado();

    if (loading) return <Spinner animation="border" />;
    
    if (error) {
        return (
            <div className="text-center my-5 text-danger">
                <p>Hubo un error al cargar los usuarios.</p>
            </div>
        );
    }

    const listaRegistros = registros ?? [];

    const usuariosFiltrados = listaRegistros.filter((item) => {
        const texto = sinAcentos(busqueda.toLowerCase().trim());
        if (texto === "") return true;
        
        // Dependiendo de si el endpoint trae el usuario dentro de 'usuario' o a nivel plano:
        const u = item.usuario || item; 
        const nombreCompleto = sinAcentos(`${u.nombre} ${u.apellido}`.toLowerCase());
        const coincideNombre = nombreCompleto.includes(texto);
        const numerosBuscados = texto.replace(/\D/g, "");
        const coincideDni = numerosBuscados !== "" && u.dni.startsWith(numerosBuscados);

        return coincideNombre || coincideDni;
    });

    const handleVerPerfil = (item: any) => {
        seleccionarUsuario(item);
        navigate("/ver-perfil", { state: {from: `/buscar-${rol}`} });
    };

    return (
        <Container className="my-4">
            <div className="barra-busqueda mb-4">
                <div className="position-relative buscador-container">
                    <Search className="icono-buscador" />
                    <Form.Control
                        type="text"
                        placeholder={`Buscar ${rol === "paciente" ? "paciente" : "médico"} DNI o por nombre...`}
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="pe-5"
                    />

                    {busqueda && (
                        <button
                            type="button"
                            className="btn-limpiar"
                            onClick={() => setBusqueda("")}
                            aria-label="Limpiar búsqueda"
                        >
                            &times;
                        </button>
                    )}
                </div>

                <div className="barra-busqueda-accion">
                    <BotonAgregar rol={rol} />
                </div>
            </div>

            {usuariosFiltrados.length === 0 ? (
                <div className="text-center my-5 text-muted bg-light p-5 rounded shadow-sm">
                    <p className="m-0">No se encontraron resultados para "<strong>{busqueda}</strong>".</p>
                </div>
            ) : (
                <Row>
                    {usuariosFiltrados.map((item) => {
                        // Extraemos los datos del usuario vinculado según el schema de Prisma
                        const u = item.usuario || item; 
                        // eslint-disable-next-line react-hooks/rules-of-hooks
                        const estilosFoto = useFotoPerfil(u.fotoPerfil);
                        const nombreCompleto = `${u.nombre} ${u.apellido}`;
                        
                        return (
                            <Col key={item.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                                <Card className="h-100 shadow-sm text-center border-0 p-3 user-card">
                                    <div className="d-flex justify-content-center my-3">
                                        <div {...estilosFoto} aria-label={`Foto de ${nombreCompleto}`} />
                                    </div>
                                    <Card.Body className="d-flex flex-column justify-content-between">
                                        <div>
                                            <Card.Title className="fs-5 mb-1 nombre">{nombreCompleto}</Card.Title>
                                            <Card.Text className="text-muted small">
                                                {rol === "medico" ? ( 
                                                    <span>{item.especialidad}</span> 
                                                ) : ( 
                                                    <span>@{u.username || u.email}</span> 
                                                )}
                                            </Card.Text>
                                        </div>
                                        <Button variant="primary" className="mt-3 w-100 btn-custom" onClick={() => handleVerPerfil(item)}> Ver Perfil </Button>
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