import { useRef, useState } from "react";
import { Alert, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { CalendarPlus, JournalPlus } from "react-bootstrap-icons";
import { AvatarIniciales } from "../AvatarIniciales";
import { NuevaEntradaForm } from "../NuevaEntradaForm";
import NuevoTurnoModal from "../Turnos/NuevoTurnoModal";
import { ToastMensaje } from "../NotifyToast";
import { DatosPerfil } from "../Perfil/DatosPerfil";
import { ListaEditable } from "./ListaEditable";
import { TurnosDelPaciente } from "./TurnosDelPaciente";
import { useHistoriaClinica } from "../../hooks/useHistoriaClinica";
import { useEdad } from "../../hooks/useEdad";
import type { PacientePerfil, Usuario } from "../../types/Usuario";
import "../../assets/styles/PanelPacienteMedico.css";
import "../../assets/styles/PanelPacienteCompacto.css";

interface PanelPacienteMedicoProps {
  usuario: Usuario;
  paciente: PacientePerfil;
}

// "2026-05-14T00:00:00.000Z" -> "14/05/2026" (sin pasar por la zona horaria)
const fechaCorta = (iso: string) => iso.slice(0, 10).split("-").reverse().join("/");

const FECHA_CONSULTA = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric" });

// Cuántas consultas se ven en la ficha; el resto está en "Ver todas"
const CONSULTAS_VISIBLES = 3;

// Ficha del paciente para el médico: a la izquierda quién es (alergias a la
// vista, contacto, obra social); a la derecha sus turnos y la historia clínica.
// Las consultas no se editan ni se borran (Ley 26.529: la historia clínica es inalterable);
// si hay un error se registra una consulta nueva.

export function PanelPacienteMedico({ usuario, paciente }: PanelPacienteMedicoProps) {
  const navigate = useNavigate();
  const { historia, loading, error, agregarEntrada, actualizarListas } = useHistoriaClinica(paciente.id);
  const edad = useEdad(paciente.fechaNacimiento);
  const [nuevaConsulta, setNuevaConsulta] = useState(false);
  const [agendar, setAgendar] = useState(false);
  const [turnosVersion, setTurnosVersion] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const historiaRef = useRef<HTMLElement>(null);

  const cobertura = paciente.coberturas?.[0];

  const abrirNuevaConsulta = () => {
    setNuevaConsulta(true);
    // Lleva la vista a la historia clínica, donde aparece el formulario
    historiaRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  };

  const consultaGuardada = async (datos: { diagnostico: string; evolucion: string; observaciones: string }) => {
    await agregarEntrada(datos);
    setNuevaConsulta(false);
    setAviso("Consulta registrada en la historia clínica");
  };

  return (
    <div className="panel-medico">
      <ToastMensaje mensaje={aviso ?? ""} tipo="toast-good" mostrar={aviso !== null} onClose={() => setAviso(null)} />

      {/* ── Columna izquierda: quién es ── */}
      <aside className="panel-medico-lateral">
        <section className="panel-medico-tarjeta panel-medico-identidad">
          <AvatarIniciales nombre={usuario.nombre} apellido={usuario.apellido} id={usuario.id} tamanio="lg" />
          <h1 className="panel-medico-nombre">{usuario.nombre} {usuario.apellido}</h1>
          <p className="panel-medico-resumen">
            {paciente.sexo}{edad !== null && `, ${edad} años`} · DNI {usuario.dni}
          </p>
          <div className="panel-medico-acciones">
            <Button variant="primary" onClick={abrirNuevaConsulta}>
              <JournalPlus aria-hidden="true" className="me-2" />Nueva consulta
            </Button>
            <Button variant="outline-primary" onClick={() => setAgendar(true)}>
              <CalendarPlus aria-hidden="true" className="me-2" />Agendar control
            </Button>
          </div>
        </section>

        {/* Alergias y antecedentes: lo primero que tiene que ver un médico */}
        <section className="panel-medico-tarjeta">
          {loading && <Spinner animation="border" size="sm" role="status" aria-label="Cargando historia clínica" />}
          {error && <Alert variant="danger" className="mb-0">{error.message}</Alert>}
          {historia && (
            <>
              <ListaEditable
                titulo="Alergias"
                items={historia.alergias}
                tono="alerta"
                vacio="Sin alergias registradas"
                onGuardar={(alergias) => actualizarListas({ alergias, antecedentes: historia.antecedentes })}
              />
              <ListaEditable
                titulo="Antecedentes"
                items={historia.antecedentes}
                tono="neutro"
                vacio="Sin antecedentes registrados"
                onGuardar={(antecedentes) => actualizarListas({ alergias: historia.alergias, antecedentes })}
              />
            </>
          )}
        </section>

        <section className="panel-medico-tarjeta">
          <h2 className="panel-medico-titulo">Datos generales</h2>
          <DatosPerfil datos={[
            ["Sexo", paciente.sexo],
            ["Nacimiento", fechaCorta(paciente.fechaNacimiento)],
            ["DNI", usuario.dni],
          ]} />
        </section>

        <section className="panel-medico-tarjeta">
          <h2 className="panel-medico-titulo">Contacto</h2>
          <DatosPerfil datos={[
            ["Teléfono", paciente.telefono],
            ["Email", usuario.email],
          ]} />
        </section>

        <section className="panel-medico-tarjeta">
          <h2 className="panel-medico-titulo">Obra social</h2>
          {cobertura ? (
            <DatosPerfil datos={[
              ["Obra social", cobertura.obraSocial.nombre],
              ["Plan", cobertura.plan],
              ["Afiliado", cobertura.nroAfiliado],
            ]} />
          ) : (
            <p className="panel-medico-vacio">Sin obra social.</p>
          )}
        </section>
      </aside>

      {/* ── Columna derecha: historia clínica (lo que se usa en cada consulta) y turnos ── */}
      <div className="panel-medico-principal">
        <section className="panel-medico-tarjeta" ref={historiaRef}>
          <h2 className="panel-medico-titulo">Historia clínica</h2>

          {/* Registrar la consulta de hoy: lo primero que se ve de la historia */}
          {nuevaConsulta ? (
            <div className="panel-medico-nueva-consulta">
              <NuevaEntradaForm onGuardar={consultaGuardada} onCancelar={() => setNuevaConsulta(false)} />
            </div>
          ) : (
            <div className="panel-medico-cta">
              <JournalPlus aria-hidden="true" className="panel-medico-cta-icono" />
              <div className="panel-medico-cta-texto">
                <p className="panel-medico-cta-titulo">¿Atendiste a {usuario.nombre} hoy?</p>
                <p className="panel-medico-cta-detalle">Registrá diagnóstico, evolución e indicaciones.</p>
              </div>
              <Button variant="primary" onClick={() => setNuevaConsulta(true)}>
                Registrar consulta
              </Button>
            </div>
          )}

          {historia && historia.entradas.length > 0 && (
            <div className="panel-medico-subtitulo-fila">
              <h3 className="panel-medico-subtitulo">Consultas anteriores</h3>
              {historia.entradas.length > CONSULTAS_VISIBLES && (
                <Button variant="primary" size="sm" className="panel-medico-ver-todas-boton" onClick={() => navigate(`/pacientes/${paciente.id}/historial`)}>
                  Ver todas ({historia.entradas.length})
                </Button>
              )}
            </div>
          )}

          {historia && historia.entradas.length === 0 && (
            <p className="panel-medico-vacio">Todavía no hay consultas registradas.</p>
          )}

          {/* Línea de tiempo: las 3 consultas más nuevas, de la más nueva a la más vieja */}
          {historia && historia.entradas.length > 0 && (
            <ol className="panel-medico-historia">
              {historia.entradas.slice(0, CONSULTAS_VISIBLES).map((e) => (
                <li key={e.id} className="panel-medico-entrada">
                  <span className="panel-medico-entrada-punto" aria-hidden="true" />
                  <p className="panel-medico-entrada-fecha">
                    {FECHA_CONSULTA.format(new Date(e.fecha))}
                    {historia.medicoResponsable && <> · {historia.medicoResponsable}</>}
                  </p>
                  <div className="panel-medico-entrada-cuerpo">
                    <p className="panel-medico-entrada-diagnostico">{e.diagnostico}</p>
                    <p><strong>Evolución:</strong> {e.evolucion}</p>
                    {e.observaciones && <p><strong>Observaciones:</strong> {e.observaciones}</p>}
                  </div>
                </li>
              ))}
            </ol>
          )}

        </section>

        <section className="panel-medico-tarjeta panel-medico-tarjeta-turnos">
          <h2 className="panel-medico-titulo">Turnos</h2>
          <TurnosDelPaciente key={turnosVersion} pacienteId={paciente.id} />
        </section>
      </div>

      {agendar && (
        <NuevoTurnoModal
          show
          pacienteIdInicial={paciente.id}
          onClose={() => setAgendar(false)}
          onAgregar={() => {
            setTurnosVersion((v) => v + 1);
            setAviso("Control agendado");
          }}
        />
      )}
    </div>
  );
}
