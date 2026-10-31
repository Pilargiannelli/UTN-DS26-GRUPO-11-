import { CalendarPlus, HeartPulseFill, JournalMedical, PeopleFill, Search } from "react-bootstrap-icons";
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
    // Solo viene para el médico: fecha de la última entrada de la historia
    ultimaConsulta?: string | null;
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

const FECHA_CONSULTA = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", year: "numeric" });

function ultimaConsulta(p: PacienteRegistro) {
    if (!p.ultimaConsulta) return <span className="directorio-sin-dato">Sin consultas</span>;
    return FECHA_CONSULTA.format(new Date(p.ultimaConsulta));
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
    // El médico entra a la historia clínica desde acá en cada consulta
    const vistaMedico = esPaciente && tieneRol("MEDICO");
    // El paciente usa la cartilla para elegir con quién atenderse
    const cartillaPaciente = !esPaciente && tieneRol("PACIENTE");
    const titulo = esPaciente ? "Pacientes" : esSecretaria ? "Profesionales" : "Médicos";

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

        // Cada paciente tiene su ficha con dirección propia (datos, turnos e
        // historia clínica): no hace falta guardarlo como "seleccionado"
        if (!isMedico) {
            navigate(`/pacientes/${item.id}`);
            return;
        }

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
    const descripcion = vistaMedico
        ? "Abrí la historia clínica de un paciente para ver sus consultas y registrar la de hoy."
        : esPaciente
            ? "Buscá un paciente por nombre o DNI para darle turno o ver sus datos."
            : cartillaPaciente
                ? "Conocé a los profesionales del consultorio y pedí turno directamente con quien elijas."
                : "Profesionales del consultorio, con su especialidad y matrícula.";

    // Resumen en números del encabezado
    const pacientesLista = esPaciente ? (listaRegistros as PacienteRegistro[]) : [];
    const hoy = new Date();
    const datos = !esPaciente
        ? [
            { valor: cantidad, texto: cantidad === 1 ? "Médico" : "Médicos" },
            { valor: new Set((listaRegistros as MedicoRegistro[]).map((m) => m.especialidad)).size, texto: "Especialidades" },
        ]
        : vistaMedico
            ? [
                { valor: cantidad, texto: cantidad === 1 ? "Paciente" : "Pacientes" },
                {
                    valor: pacientesLista.filter((p) => {
                        if (!p.ultimaConsulta) return false;
                        const f = new Date(p.ultimaConsulta);
                        return f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear();
                    }).length,
                    texto: "Atendidos este mes",
                },
            ]
            : [
                { valor: cantidad, texto: cantidad === 1 ? "Paciente" : "Pacientes" },
                { valor: pacientesLista.filter((p) => p.coberturas?.length).length, texto: "Con obra social" },
            ];

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
                etiqueta={esPaciente ? "Directorio clínico" : "Cartilla médica"}
                icono={esPaciente ? <PeopleFill /> : <HeartPulseFill />}
                descripcion={descripcion}
                datos={datos}
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
                                        {vistaMedico && <th scope="col">Última consulta</th>}
                                    </>
                                ) : (
                                    <>
                                        <th scope="col">Especialidad</th>
                                        <th scope="col">Matrícula</th>
                                        {cartillaPaciente && <th scope="col">Atención</th>}
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
                                                {vistaMedico && (
                                                    <td data-label="Última consulta">{ultimaConsulta(paciente)}</td>
                                                )}
                                            </>
                                        )}
                                        {medico && (
                                            <>
                                                <td data-label="Especialidad">{medico.especialidad}</td>
                                                <td data-label="Matrícula" className="directorio-numero">{medico.matricula}</td>
                                                {cartillaPaciente && (
                                                    <td data-label="Atención">
                                                        Lunes a viernes
                                                        <span className="directorio-secundario">8 a 20 h</span>
                                                    </td>
                                                )}
                                            </>
                                        )}
                                        <td className="directorio-acciones">
                                            {paciente && esSecretaria && (
                                                <Button size="sm" variant="outline-primary" onClick={() => setPacienteTurno(paciente)}>
                                                    Dar turno
                                                </Button>
                                            )}
                                            {medico && cartillaPaciente && (
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    className="directorio-historia"
                                                    onClick={() => navigate(`/pedir-turno?medico=${medico.id}`)}
                                                    aria-label={`Pedir turno con ${u.nombre} ${u.apellido}`}
                                                >
                                                    <CalendarPlus aria-hidden="true" className="me-2" />
                                                    Pedir turno
                                                </Button>
                                            )}
                                            {paciente && vistaMedico ? (
                                                // Un solo acceso, bien visible: en la ficha ve la
                                                // historia y registra la consulta en el mismo lugar
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    className="directorio-historia"
                                                    onClick={() => handleVerPerfil(item)}
                                                    aria-label={`Historia clínica de ${u.nombre} ${u.apellido}`}
                                                >
                                                    <JournalMedical aria-hidden="true" className="me-2" />
                                                    Historia clínica
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="link"
                                                    onClick={() => handleVerPerfil(item)}
                                                    aria-label={`Ver perfil de ${u.nombre} ${u.apellido}`}
                                                >
                                                    Ver perfil ›
                                                </Button>
                                            )}
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
