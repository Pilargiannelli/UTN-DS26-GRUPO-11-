import { Search } from "react-bootstrap-icons";
import { useFetch } from "../hooks/useFetch";
import { useFotoPerfil } from "../hooks/useFotoPerfil";
import { Container, Row, Col, Card, Button, Spinner, Form } from "react-bootstrap";
import '../assets/styles/ListarUsuarios.css';
import { useState } from "react";
import { useUsuarioSeleccionado } from "../hooks/useUsuarioSeleccionado";
import { useNavigate } from "react-router-dom";
import { BotonAgregar } from "./BotonAgregar";
import type { CoberturaPaciente } from "../types/Usuario";
import { useAuth } from "../hooks/useAuth";

interface ListarUsuariosProps {
    rol: "paciente" | "medico";
}

interface UsuarioBasico {
    id: number;
    username?: string;
    nombre: string;
    apellido: string;
    dni: string;
    email: string;
    fotoPerfil?: string | null;
}

interface MedicoRegistro {
    id: number;
    usuarioId: number;
    especialidad: string;
    matricula: string;
    usuario: UsuarioBasico;
}

interface PacienteRegistro {
    id: number;
    usuarioId: number;
    fechaNacimiento: string;
    sexo: string;
    telefono: string;
    coberturas?: CoberturaPaciente[];
    usuario: UsuarioBasico;
}

type RegistroUsuario = MedicoRegistro | PacienteRegistro;

const sinAcentos = (texto: string) =>
    texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function ListarUsuarios({ rol }: ListarUsuariosProps) {
    const endpoint = rol === "medico" ? "/medicos" : "/pacientes";
    const { data: registros, loading, error } = useFetch<RegistroUsuario[]>(endpoint);
    
    const [busqueda, setBusqueda] = useState("");
    const navigate = useNavigate();
    const { tieneRol } = useAuth();
    const { seleccionarUsuario } = useUsuarioSeleccionado();

    if (loading) return <Spinner animation="border" />;
    
    if (error) {
        return (
            <div className="text-center my-5 text-danger" role="alert">
                <p>No se pudo cargar el listado: {error.message}</p>
            </div>
        );
    }

    const listaRegistros = registros ?? [];

    const usuariosFiltrados = listaRegistros.filter((item) => {
        const texto = sinAcentos(busqueda.toLowerCase().trim());
        if (texto === "") return true;
        
        const u = item.usuario; 
        const nombreCompleto = sinAcentos(`${u.nombre} ${u.apellido}`.toLowerCase());
        const coincideNombre = nombreCompleto.includes(texto);
        const numerosBuscados = texto.replace(/\D/g, "");
        const coincideDni = numerosBuscados !== "" && u.dni?.startsWith(numerosBuscados);

        return coincideNombre || coincideDni;
    });

    const handleVerPerfil = (item: RegistroUsuario) => {
        const isMedico = rol === "medico";
        
        // Normalizamos asegurando que username sea string para cumplir con el tipo Usuario
        const usuarioNormalizado = {
            ...item.usuario,
            username: item.usuario.username || item.usuario.email || "",
            rol: isMedico ? ("MEDICO" as const) : ("PACIENTE" as const),
            medico: isMedico ? {
                id: item.id,
                especialidad: (item as MedicoRegistro).especialidad,
                matricula: (item as MedicoRegistro).matricula,
                usuarioId: item.usuarioId
            } : null,
            paciente: !isMedico ? {
                id: item.id,
                fechaNacimiento: (item as PacienteRegistro).fechaNacimiento,
                sexo: (item as PacienteRegistro).sexo,
                telefono: (item as PacienteRegistro).telefono,
                coberturas: (item as PacienteRegistro).coberturas ?? [],
                usuarioId: item.usuarioId
            } : null,
        };

        seleccionarUsuario(usuarioNormalizado as Parameters<typeof seleccionarUsuario>[0]);
        navigate("/ver-perfil", { state: { from: `/buscar-${rol}` } });
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

                {/* Solo la secretaria registra pacientes (HU-001); POST /medicos no existe */}
                {rol === "paciente" && tieneRol("SECRETARIA") && (
                    <div className="barra-busqueda-accion">
                        <BotonAgregar rol={rol} />
                    </div>
                )}
            </div>

            {listaRegistros.length === 0 ? (
                <div className="text-center my-5 text-muted bg-light p-5 rounded shadow-sm">
                    <p className="m-0">Todavía no hay {rol === "paciente" ? "pacientes" : "médicos"} registrados.</p>
                </div>
            ) : usuariosFiltrados.length === 0 ? (
                <div className="text-center my-5 text-muted bg-light p-5 rounded shadow-sm">
                    <p className="m-0">No se encontraron resultados para "<strong>{busqueda}</strong>".</p>
                </div>
            ) : (
                <Row>
                    {usuariosFiltrados.map((item) => {
                        const u = item.usuario; 
                        // eslint-disable-next-line react-hooks/rules-of-hooks
                        const estilosFoto = useFotoPerfil(u.fotoPerfil ?? null);
                        const nombreCompleto = `${u.nombre} ${u.apellido}`;
                        const especialidadMedico = rol === "medico" ? (item as MedicoRegistro).especialidad : null;
                        
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
                                                    <span>{especialidadMedico}</span> 
                                                ) : (
                                                    <span>DNI {u.dni}</span>
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