import { Search } from "react-bootstrap-icons";
import { useFetch } from "../hooks/useFetch";
import { Button, Spinner, Form, Alert, Table } from "react-bootstrap";
import '../assets/styles/ListarUsuarios.css';
import { useState } from "react";
import { useUsuarioSeleccionado } from "../hooks/useUsuarioSeleccionado";
import { useNavigate } from "react-router-dom";
import type { CoberturaPaciente } from "../types/Usuario";
import type { Turno } from "../types/Turno";
import { useAuth } from "../hooks/useAuth";
import { useEdad } from "../hooks/useEdad";
import { EncabezadoPagina } from "./EncabezadoPagina";
import { AvatarIniciales } from "./AvatarIniciales";
import NuevoTurnoModal from "./Turnos/NuevoTurnoModal";
import { ToastMensaje } from "./NotifyToast";
import { formatearHora } from "../utils/fecha";

interface ListarUsuariosProps {
    rol: "paciente" | "medico";
}

interface UsuarioBasico {
    id: number;
    username?: string;
    nombre: string;
    apellido: string;
    dni?: string;
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
    texto.normalize("NFD").replace(/[̀-ͯ]/g, "");

function Edad({ fechaNacimiento }: { fechaNacimiento: string }) {
    const edad = useEdad(fechaNacimiento);
    return <>{edad !== null ? `${edad} años` : "—"}</>;
}

function obraSocial(p: PacienteRegistro) {
    const cobertura = p.coberturas?.[0];
    if (!cobertura) return <span className="directorio-sin-dato">Sin obra social</span>;
    return (
        <>
            {cobertura.obraSocial.nombre}
            <span className="directorio-secundario">Plan {cobertura.plan}</span>
        </>
    );
}

// Directorio de pacientes o de médicos: encabezado, buscador y una fila por
// persona con los datos que se usan en el consultorio
export function ListarUsuarios({ rol }: ListarUsuariosProps) {
    const esPaciente = rol === "paciente";
    const endpoint = esPaciente ? "/pacientes" : "/medicos";
    const { data: registros, loading, error } = useFetch<RegistroUsuario[]>(endpoint);

    const [busqueda, setBusqueda] = useState("");
    const navigate = useNavigate();
    const { tieneRol } = useAuth();
    const { seleccionarUsuario } = useUsuarioSeleccionado();
    // "Dar turno": paciente para el que se abre el modal de nuevo turno
    const [pacienteTurno, setPacienteTurno] = useState<PacienteRegistro | null>(null);
    const [turnoAgendado, setTurnoAgendado] = useState<string | null>(null);

    // Solo la secretaria registra pacientes (HU-001) y da turnos desde acá
    const esSecretaria = tieneRol("SECRETARIA");
    const titulo = esPaciente ? "Pacientes" : "Médicos";

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" role="status" aria-label={`Cargando ${titulo.toLowerCase()}`} />
            </div>
        );
    }

    if (error) {
        return (
            <>
                <EncabezadoPagina titulo={titulo} />
                <Alert variant="danger">No se pudo cargar el listado: {error.message}</Alert>
            </>
        );
    }

    const listaRegistros = [...(registros ?? [])].sort((a, b) =>
        `${a.usuario.apellido} ${a.usuario.nombre}`.localeCompare(`${b.usuario.apellido} ${b.usuario.nombre}`)
    );

    const usuariosFiltrados = listaRegistros.filter((item) => {
        const texto = sinAcentos(busqueda.toLowerCase().trim());
        if (texto === "") return true;

        const u = item.usuario;
        const nombreCompleto = sinAcentos(`${u.nombre} ${u.apellido}`.toLowerCase());
        const coincideNombre = nombreCompleto.includes(texto);
        const numerosBuscados = texto.replace(/\D/g, "");
        const coincideDni = numerosBuscados !== "" && !!u.dni?.startsWith(numerosBuscados);

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

    const turnoCreado = (turno: Turno) => {
        const fecha = new Date(turno.fechaHora).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
        setTurnoAgendado(`Turno agendado para ${turno.paciente.usuario.nombre} el ${fecha} a las ${formatearHora(turno.fechaHora)}`);
    };

    const cantidad = listaRegistros.length;
    const descripcion = `${cantidad} ${esPaciente ? (cantidad === 1 ? "paciente registrado" : "pacientes registrados") : (cantidad === 1 ? "médico en la cartilla" : "médicos en la cartilla")}`;

    return (
        <section className="directorio">
            <ToastMensaje
                mensaje={turnoAgendado ?? ""}
                tipo="toast-good"
                mostrar={turnoAgendado !== null}
                onClose={() => setTurnoAgendado(null)}
            />

            <EncabezadoPagina
                titulo={titulo}
                descripcion={descripcion}
                accion={esPaciente && esSecretaria && (
                    <Button variant="primary" onClick={() => navigate("/registrar-paciente")}>
                        + Registrar paciente
                    </Button>
                )}
            />

            <div className="directorio-card">
                <div className="directorio-buscador">
                    <Search className="directorio-buscador-icono" aria-hidden="true" />
                    <Form.Label htmlFor="directorio-buscar" className="visually-hidden">
                        Buscar {esPaciente ? "paciente" : "médico"}
                    </Form.Label>
                    <Form.Control
                        id="directorio-buscar"
                        type="search"
                        placeholder={esPaciente ? "Buscar por nombre o DNI" : "Buscar por nombre"}
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                    {busqueda && (
                        <span className="directorio-resultados" aria-live="polite">
                            {usuariosFiltrados.length} {usuariosFiltrados.length === 1 ? "resultado" : "resultados"}
                        </span>
                    )}
                </div>

                {cantidad === 0 ? (
                    <div className="directorio-vacio">
                        <p>Todavía no hay {esPaciente ? "pacientes registrados" : "médicos en la cartilla"}.</p>
                        {esPaciente && esSecretaria && (
                            <Button variant="primary" onClick={() => navigate("/registrar-paciente")}>
                                Registrar el primer paciente
                            </Button>
                        )}
                    </div>
                ) : usuariosFiltrados.length === 0 ? (
                    <div className="directorio-vacio">
                        <p>No encontramos {esPaciente ? "pacientes" : "médicos"} para "<strong>{busqueda}</strong>".</p>
                        <Button variant="outline-secondary" onClick={() => setBusqueda("")}>Limpiar búsqueda</Button>
                    </div>
                ) : (
                    <Table className="directorio-tabla align-middle mb-0">
                        <thead>
                            <tr>
                                <th scope="col">{esPaciente ? "Paciente" : "Médico"}</th>
                                {esPaciente ? (
                                    <>
                                        <th scope="col">DNI</th>
                                        <th scope="col">Edad</th>
                                        <th scope="col">Teléfono</th>
                                        <th scope="col">Obra social</th>
                                    </>
                                ) : (
                                    <>
                                        <th scope="col">Especialidad</th>
                                        <th scope="col">Matrícula</th>
                                    </>
                                )}
                                <th scope="col"><span className="visually-hidden">Acciones</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuariosFiltrados.map((item) => {
                                const u = item.usuario;
                                const paciente = esPaciente ? (item as PacienteRegistro) : null;
                                const medico = !esPaciente ? (item as MedicoRegistro) : null;

                                return (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="directorio-persona">
                                                <AvatarIniciales nombre={u.nombre} apellido={u.apellido} id={item.id} />
                                                <div>
                                                    <button type="button" className="directorio-nombre" onClick={() => handleVerPerfil(item)}>
                                                        {u.nombre} {u.apellido}
                                                    </button>
                                                    <span className="directorio-secundario">{u.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        {paciente && (
                                            <>
                                                <td data-label="DNI" className="directorio-numero">{u.dni}</td>
                                                <td data-label="Edad"><Edad fechaNacimiento={paciente.fechaNacimiento} /></td>
                                                <td data-label="Teléfono" className="directorio-numero">{paciente.telefono}</td>
                                                <td data-label="Obra social">{obraSocial(paciente)}</td>
                                            </>
                                        )}
                                        {medico && (
                                            <>
                                                <td data-label="Especialidad">{medico.especialidad}</td>
                                                <td data-label="Matrícula" className="directorio-numero">{medico.matricula}</td>
                                            </>
                                        )}
                                        <td className="directorio-acciones">
                                            {paciente && esSecretaria && (
                                                <Button size="sm" variant="outline-primary" onClick={() => setPacienteTurno(paciente)}>
                                                    Dar turno
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="link"
                                                onClick={() => handleVerPerfil(item)}
                                                aria-label={`Ver perfil de ${u.nombre} ${u.apellido}`}
                                            >
                                                Ver perfil ›
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                )}
            </div>

            {/* Se monta por paciente: el modal abre con ese paciente elegido */}
            {pacienteTurno && (
                <NuevoTurnoModal
                    key={pacienteTurno.id}
                    show
                    pacienteIdInicial={pacienteTurno.id}
                    onClose={() => setPacienteTurno(null)}
                    onAgregar={turnoCreado}
                />
            )}
        </section>
    );
}
