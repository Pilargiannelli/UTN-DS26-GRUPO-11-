import { useState } from "react";
import { Button, Container } from "react-bootstrap";
import { CalendarPlus, PencilSquare } from "react-bootstrap-icons";
import Layout from "../components/Layout/Layout.tsx";
import { BotonVolver } from "../components/BotonVolver.tsx";
import { AvatarIniciales } from "../components/AvatarIniciales.tsx";
import { SeccionPerfil, DatosPerfil } from "../components/Perfil/SeccionPerfil.tsx";
import { DatosCuentaForm } from "../components/Perfil/DatosCuentaForm.tsx";
import { ProximosTurnosPaciente } from "../components/Perfil/ProximosTurnosPaciente.tsx";
import { NewPasswordForm } from "../components/CambiarPasswordForm.tsx";
import { PacienteFormFields } from "../components/PacienteFormFields.tsx";
import { HistorialMedicoCard } from "../components/HistorialMedicoCard.tsx";
import NuevoTurnoModal from "../components/Turnos/NuevoTurnoModal.tsx";
import { ToastMensaje } from "../components/NotifyToast.tsx";
import { useUsuarioSeleccionado } from "../hooks/useUsuarioSeleccionado.ts";
import { useAuth } from "../hooks/useAuth.ts";
import { useEdad } from "../hooks/useEdad.ts";
import type { Usuario } from "../types/Usuario.ts";
import type { UsuarioSesion } from "../types/UsuarioSesion.ts";
import "../assets/styles/Perfil.css";

interface VerUsuarioProps {
    // /mi-cuenta: siempre el usuario logueado, nunca el último perfil que se
    // abrió desde Pacientes o Médicos (eso queda en /ver-perfil)
    propio?: boolean;
}

const NOMBRE_ROL = { SECRETARIA: "Secretaría", MEDICO: "Médico", PACIENTE: "Paciente" } as const;

// "2026-05-14T00:00:00.000Z" -> "14/05/2026" (sin pasar por la zona horaria)
const fechaCorta = (iso?: string) => (iso ? iso.slice(0, 10).split("-").reverse().join("/") : "—");

type Edicion = "cuenta" | "paciente" | "password" | null;

// Perfil: la cuenta propia (/mi-cuenta) o el de un paciente o médico abierto
// desde los listados (/ver-perfil). Todas las acciones están a la vista en su
// sección ("Editar", "Cambiar", "Dar turno") y se editan en el mismo lugar.
function VerUsuario({ propio = false }: VerUsuarioProps) {
    const { usuario, setUsuario, tieneRol } = useAuth();
    const { usuarioSeleccionado, seleccionarUsuario } = useUsuarioSeleccionado();
    const [editando, setEditando] = useState<Edicion>(null);
    const [aviso, setAviso] = useState<string | null>(null);
    const [darTurno, setDarTurno] = useState(false);
    // Cambia al agendar un turno, para volver a pedir los próximos turnos
    const [turnosVersion, setTurnosVersion] = useState(0);

    const perfil = (propio ? usuario : usuarioSeleccionado || usuario) as Usuario | null;
    const paciente = perfil?.paciente ?? null;
    const edad = useEdad(paciente?.fechaNacimiento ?? "");

    if (!perfil) {
        return (
            <Layout>
                <Container className="perfil">
                    <BotonVolver />
                    <p className="perfil-nota">No hay usuario seleccionado ni sesión activa.</p>
                </Container>
            </Layout>
        );
    }

    const esMiPerfil = !!usuario && usuario.id === perfil.id;
    const esPaciente = perfil.rol === "PACIENTE";
    // Los datos del paciente (teléfono, obra social...) los edita la secretaria
    const secretariaEditaPaciente = esPaciente && !esMiPerfil && tieneRol("SECRETARIA");
    const verTurnos = esPaciente && !esMiPerfil && (tieneRol("SECRETARIA") || tieneRol("MEDICO"));
    // Historia clínica: el médico la de sus pacientes, el paciente la suya
    const verHistoria = esPaciente && !!paciente && (tieneRol("MEDICO") || esMiPerfil);
    const cobertura = paciente?.coberturas?.[0];

    const terminarEdicion = (mensaje: string) => {
        setEditando(null);
        setAviso(mensaje);
    };

    // Mi cuenta: PATCH /auth/yo devolvió el usuario actualizado
    const cuentaGuardada = (actualizado: UsuarioSesion) => {
        if (usuario) setUsuario({ ...usuario, ...actualizado });
        terminarEdicion("Datos actualizados correctamente");
    };

    // Ficha del paciente: PUT /pacientes/:id (la hace la secretaria)
    const pacienteGuardado = (actualizado: Usuario) => {
        seleccionarUsuario(actualizado);
        terminarEdicion("Datos del paciente actualizados");
    };

    const botonEditar = (seccion: Edicion, texto = "Editar") =>
        editando !== seccion && (
            <Button variant="outline-primary" size="sm" onClick={() => setEditando(seccion)}>
                <PencilSquare aria-hidden="true" className="me-1" />{texto}
            </Button>
        );

    return (
        <Layout>
            <ToastMensaje mensaje={aviso ?? ""} tipo="toast-good" mostrar={aviso !== null} onClose={() => setAviso(null)} />

            <Container className="perfil">
                <BotonVolver />

                {/* ── Encabezado: quién es y las acciones principales ── */}
                <header className="perfil-encabezado">
                    <AvatarIniciales nombre={perfil.nombre} apellido={perfil.apellido} id={perfil.id} tamanio="lg" />
                    <div className="perfil-encabezado-texto">
                        <h1 className="perfil-nombre">{perfil.nombre} {perfil.apellido}</h1>
                        <p className="perfil-subtitulo">
                            {esMiPerfil ? "Mi cuenta" : NOMBRE_ROL[perfil.rol]}
                            {" · "}{perfil.email}
                        </p>
                    </div>
                    {secretariaEditaPaciente && paciente && (
                        <Button variant="primary" onClick={() => setDarTurno(true)}>
                            <CalendarPlus aria-hidden="true" className="me-2" />Dar turno
                        </Button>
                    )}
                </header>

                <div className="perfil-grilla">
                    <div className="perfil-columna">
                        {/* ── Datos ── */}
                        {secretariaEditaPaciente ? (
                            <SeccionPerfil titulo="Datos del paciente" accion={botonEditar("paciente")}>
                                {editando === "paciente" ? (
                                    <PacienteFormFields usuario={perfil} onSave={pacienteGuardado} onCancel={() => setEditando(null)} />
                                ) : (
                                    <DatosPerfil datos={[
                                        ["DNI", perfil.dni],
                                        ["Email", perfil.email],
                                        ["Teléfono", paciente?.telefono ?? "—"],
                                        ["Sexo", paciente?.sexo ?? "—"],
                                        ["Nacimiento", `${fechaCorta(paciente?.fechaNacimiento)}${edad !== null ? ` (${edad} años)` : ""}`],
                                        ["Obra social", cobertura ? `${cobertura.obraSocial.nombre} · Plan ${cobertura.plan} · Afiliado ${cobertura.nroAfiliado}` : "Sin obra social"],
                                    ]} />
                                )}
                            </SeccionPerfil>
                        ) : (
                            <SeccionPerfil titulo="Datos personales" accion={esMiPerfil && botonEditar("cuenta")}>
                                {editando === "cuenta" && usuario ? (
                                    <DatosCuentaForm usuario={usuario} onGuardado={cuentaGuardada} onCancelar={() => setEditando(null)} />
                                ) : (
                                    <DatosPerfil datos={[
                                        ["Nombre", `${perfil.nombre} ${perfil.apellido}`],
                                        ["DNI", perfil.dni],
                                        ["Email", perfil.email],
                                        ...(perfil.medico
                                            ? ([["Especialidad", perfil.medico.especialidad], ["Matrícula", perfil.medico.matricula]] as [string, string][])
                                            : []),
                                    ]} />
                                )}
                            </SeccionPerfil>
                        )}

                        {/* El paciente ve su ficha, pero la modifica la secretaría */}
                        {esPaciente && !secretariaEditaPaciente && paciente && (
                            <SeccionPerfil titulo="Ficha del paciente">
                                <DatosPerfil datos={[
                                    ["Teléfono", paciente.telefono],
                                    ["Sexo", paciente.sexo],
                                    ["Nacimiento", `${fechaCorta(paciente.fechaNacimiento)}${edad !== null ? ` (${edad} años)` : ""}`],
                                    ["Obra social", cobertura ? `${cobertura.obraSocial.nombre} · Plan ${cobertura.plan} · Afiliado ${cobertura.nroAfiliado}` : "Sin obra social"],
                                ]} />
                                {esMiPerfil && (
                                    <p className="perfil-nota">Para cambiar estos datos, comunicate con la secretaría de la clínica.</p>
                                )}
                            </SeccionPerfil>
                        )}

                        {/* ── Seguridad: solo en la cuenta propia ── */}
                        {esMiPerfil && (
                            <SeccionPerfil titulo="Seguridad" accion={botonEditar("password", "Cambiar")}>
                                {editando === "password" ? (
                                    <NewPasswordForm
                                        onListo={() => terminarEdicion("Contraseña actualizada")}
                                        onCancelar={() => setEditando(null)}
                                    />
                                ) : (
                                    <DatosPerfil datos={[["Contraseña", "••••••••"]]} />
                                )}
                            </SeccionPerfil>
                        )}
                    </div>

                    {(verTurnos || verHistoria) && paciente && (
                        <div className="perfil-columna">
                            {verTurnos && (
                                <SeccionPerfil titulo="Próximos turnos">
                                    <ProximosTurnosPaciente key={turnosVersion} pacienteId={paciente.id} />
                                </SeccionPerfil>
                            )}
                            {verHistoria && <HistorialMedicoCard pacienteId={paciente.id} />}
                        </div>
                    )}
                </div>
            </Container>

            {darTurno && paciente && (
                <NuevoTurnoModal
                    show
                    pacienteIdInicial={paciente.id}
                    onClose={() => setDarTurno(false)}
                    onAgregar={() => {
                        setTurnosVersion((v) => v + 1);
                        setAviso("Turno agendado");
                    }}
                />
            )}
        </Layout>
    );
}

export default VerUsuario;
