import { useState, type ReactNode } from "react";
import { Button, Container, Tab, Tabs } from "react-bootstrap";
import { CalendarPlus } from "react-bootstrap-icons";
import Layout from "../components/Layout/Layout.tsx";
import { BotonVolver } from "../components/BotonVolver.tsx";
import { AvatarIniciales } from "../components/AvatarIniciales.tsx";
import { DatosPerfil } from "../components/Perfil/DatosPerfil.tsx";
import { DatosCuentaForm } from "../components/Perfil/DatosCuentaForm.tsx";
import { ProximosTurnosPaciente } from "../components/Perfil/ProximosTurnosPaciente.tsx";
import { NewPasswordForm } from "../components/CambiarPasswordForm.tsx";
import { PacienteFormFields } from "../components/PacienteFormFields.tsx";
import { HistorialMedicoCard } from "../components/HistorialMedicoCard.tsx";
import { PanelPacienteMedico } from "../components/Medico/PanelPacienteMedico.tsx";
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

// Panel de una pestaña: título + descripción y el contenido en una tarjeta
function Panel({ titulo, descripcion, children }: { titulo: string; descripcion?: string; children: ReactNode }) {
    return (
        <section className="perfil-panel">
            <header className="perfil-panel-encabezado">
                <h2 className="perfil-panel-titulo">{titulo}</h2>
                {descripcion && <p className="perfil-panel-descripcion">{descripcion}</p>}
            </header>
            {children}
        </section>
    );
}

// Mi cuenta (/mi-cuenta) y perfil de un paciente o médico (/ver-perfil).
// Arriba, quién es; abajo, una pestaña por tema con los datos editables
// directo (sin "Editar" previo): "Guardar cambios" se habilita al cambiar algo.
function VerUsuario({ propio = false }: VerUsuarioProps) {
    const { usuario, setUsuario, tieneRol } = useAuth();
    const { usuarioSeleccionado, seleccionarUsuario } = useUsuarioSeleccionado();
    const [aviso, setAviso] = useState<string | null>(null);
    const [darTurno, setDarTurno] = useState(false);
    // Cambian para volver a montar: los próximos turnos al agendar uno, y el
    // formulario del paciente al descartar cambios
    const [turnosVersion, setTurnosVersion] = useState(0);
    const [fichaVersion, setFichaVersion] = useState(0);

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

    const fichaPaciente: [string, string][] = paciente ? [
        ["Teléfono", paciente.telefono],
        ["Sexo", paciente.sexo],
        ["Nacimiento", `${fechaCorta(paciente.fechaNacimiento)}${edad !== null ? ` (${edad} años)` : ""}`],
        ["Obra social", cobertura ? `${cobertura.obraSocial.nombre} · Plan ${cobertura.plan} · Afiliado ${cobertura.nroAfiliado}` : "Sin obra social"],
    ] : [];

    // El médico ve la ficha clínica completa del paciente: datos, alergias,
    // turnos e historia clínica en una sola pantalla
    if (tieneRol("MEDICO") && esPaciente && !esMiPerfil && paciente) {
        return (
            <Layout>
                <Container className="perfil perfil-medico">
                    <BotonVolver />
                    <PanelPacienteMedico usuario={perfil} paciente={paciente} />
                </Container>
            </Layout>
        );
    }

    // Mi cuenta: PATCH /auth/yo devolvió el usuario actualizado
    const cuentaGuardada = (actualizado: UsuarioSesion) => {
        if (usuario) setUsuario({ ...usuario, ...actualizado });
        setAviso("Datos actualizados correctamente");
    };

    // Datos del paciente: PUT /pacientes/:id (la hace la secretaria)
    const pacienteGuardado = (actualizado: Usuario) => {
        seleccionarUsuario(actualizado);
        setFichaVersion((v) => v + 1);
        setAviso("Datos del paciente actualizados");
    };

    return (
        <Layout>
            <ToastMensaje mensaje={aviso ?? ""} tipo="toast-good" mostrar={aviso !== null} onClose={() => setAviso(null)} />

            <Container className="perfil">
                {!propio && <BotonVolver />}

                {/* ── Quién es: avatar, nombre, contacto y rol ── */}
                <header className="perfil-encabezado">
                    <AvatarIniciales nombre={perfil.nombre} apellido={perfil.apellido} id={perfil.id} tamanio="xl" />
                    <h1 className="perfil-nombre">{perfil.nombre} {perfil.apellido}</h1>
                    <p className="perfil-subtitulo">
                        {perfil.email}
                        {paciente?.telefono && <> · {paciente.telefono}</>}
                    </p>
                    <span className={`perfil-rol perfil-rol-${perfil.rol.toLowerCase()}`}>
                        {esMiPerfil ? `Mi cuenta · ${NOMBRE_ROL[perfil.rol]}` : NOMBRE_ROL[perfil.rol]}
                    </span>
                    {secretariaEditaPaciente && paciente && (
                        <Button variant="primary" className="perfil-accion" onClick={() => setDarTurno(true)}>
                            <CalendarPlus aria-hidden="true" className="me-2" />Dar turno
                        </Button>
                    )}
                </header>

                {/* ── Una pestaña por tema ── */}
                <Tabs
                    defaultActiveKey="datos"
                    id="perfil-pestanias"
                    variant="pills"
                    className="perfil-tabs"
                    mountOnEnter
                    unmountOnExit
                    transition={false}
                >
                    <Tab eventKey="datos" title={secretariaEditaPaciente ? "Datos del paciente" : "Datos personales"}>
                        {secretariaEditaPaciente ? (
                            <Panel titulo="Datos del paciente" descripcion="Datos personales, de contacto y obra social.">
                                <PacienteFormFields
                                    key={fichaVersion}
                                    usuario={perfil}
                                    onSave={pacienteGuardado}
                                    onCancel={() => setFichaVersion((v) => v + 1)}
                                />
                            </Panel>
                        ) : esMiPerfil && usuario ? (
                            <Panel titulo="Datos personales" descripcion="Tu nombre y el email con el que ingresás.">
                                <DatosCuentaForm usuario={usuario} onGuardado={cuentaGuardada} />
                            </Panel>
                        ) : (
                            <Panel titulo="Datos personales">
                                <DatosPerfil datos={[
                                    ["Nombre", `${perfil.nombre} ${perfil.apellido}`],
                                    ["DNI", perfil.dni],
                                    ["Email", perfil.email],
                                    ...(perfil.medico
                                        ? ([["Especialidad", perfil.medico.especialidad], ["Matrícula", perfil.medico.matricula]] as [string, string][])
                                        : []),
                                    ...fichaPaciente,
                                ]} />
                            </Panel>
                        )}
                    </Tab>

                    {/* El paciente ve su ficha, pero la modifica la secretaría */}
                    {esMiPerfil && esPaciente && paciente && (
                        <Tab eventKey="ficha" title="Mi ficha">
                            <Panel titulo="Mi ficha" descripcion="Para cambiar estos datos, comunicate con la secretaría de la clínica.">
                                <DatosPerfil datos={fichaPaciente} />
                            </Panel>
                        </Tab>
                    )}

                    {verTurnos && paciente && (
                        <Tab eventKey="turnos" title="Próximos turnos">
                            <Panel titulo="Próximos turnos">
                                <ProximosTurnosPaciente key={turnosVersion} pacienteId={paciente.id} />
                            </Panel>
                        </Tab>
                    )}

                    {verHistoria && paciente && (
                        <Tab eventKey="historia" title="Historia clínica">
                            <HistorialMedicoCard pacienteId={paciente.id} />
                        </Tab>
                    )}

                    {esMiPerfil && (
                        <Tab eventKey="seguridad" title="Seguridad">
                            <Panel titulo="Contraseña" descripcion="Elegí una contraseña que no uses en otros sitios.">
                                <NewPasswordForm onListo={() => setAviso("Contraseña actualizada")} />
                            </Panel>
                        </Tab>
                    )}
                </Tabs>
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
