import { useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Button, Container, Spinner } from "react-bootstrap";
import { CalendarPlus, CheckCircleFill, InfoCircle } from "react-bootstrap-icons";
import Layout from "../components/Layout/Layout.tsx";
import { EncabezadoPagina } from "../components/EncabezadoPagina";
import { AvatarIniciales } from "../components/AvatarIniciales";
import { SelectorTurno } from "../components/SelectorTurno";
import { useFetch } from "../hooks/useFetch";
import { useAuth } from "../hooks/useAuth";
import { apiFetch, ApiError } from "../services/api";
import type { MedicoTurno, Turno } from "../types/Turno";
import "../assets/styles/PedirTurno.css";

const FECHA_RESUMEN = new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long" });

function Paso({ numero, titulo, listo, children }: { numero: number; titulo: string; listo: boolean; children: ReactNode }) {
  return (
    <section className={`pedir-paso${listo ? " pedir-paso-listo" : ""}`} aria-labelledby={`paso-${numero}`}>
      <h2 className="pedir-paso-titulo" id={`paso-${numero}`}>
        <span className="pedir-paso-numero" aria-hidden="true">
          {listo ? <CheckCircleFill /> : numero}
        </span>
        {titulo}
      </h2>
      <div className="pedir-paso-cuerpo">{children}</div>
    </section>
  );
}

// Pedir turno en tres pasos (especialidad, profesional, día y horario) con un
// resumen al costado que se va completando. Desde la cartilla se llega con
// ?medico=ID y el profesional ya elegido.
export function PedirTurno() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { usuario } = useAuth();

  // GET /api/especialidades manda un array de strings; GET /api/medicos es público
  const { data: especialidadesAPI, loading: cargandoEsp } = useFetch<string[]>("/especialidades");
  const { data: medicosAPI, loading: cargandoMed } = useFetch<MedicoTurno[]>("/medicos");

  const [especialidad, setEspecialidad] = useState("");
  const [medicoId, setMedicoId] = useState(params.get("medico") ?? "");
  const [fecha, setFecha] = useState("");
  const [horario, setHorario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recargarOcupados, setRecargarOcupados] = useState(0);

  const medicos = medicosAPI ?? [];
  const medicoPorId = (id: string) => medicos.find((m) => String(m.id) === id);
  // Si vino un médico elegido, su especialidad queda elegida también
  const especialidadElegida = especialidad || medicoPorId(medicoId)?.especialidad || "";
  const medicosDeEspecialidad = medicos.filter((m) => m.especialidad === especialidadElegida);
  // Con un solo profesional en la especialidad no hace falta elegirlo
  const medicoElegidoId = medicoId || (medicosDeEspecialidad.length === 1 ? String(medicosDeEspecialidad[0].id) : "");
  const medico = medicoPorId(medicoElegidoId);

  const listo = !!(especialidadElegida && medico && fecha && horario);
  const cobertura = usuario?.paciente?.coberturas?.[0];

  const elegirEspecialidad = (esp: string) => {
    setEspecialidad(esp);
    setMedicoId("");
    setFecha("");
    setHorario("");
  };

  const elegirMedico = (id: string) => {
    setMedicoId(id);
    setFecha("");
    setHorario("");
  };

  const confirmarTurno = async () => {
    if (!medico) return;
    setEnviando(true);
    setErrorMsg(null);
    try {
      // POST /api/turnos como PACIENTE: solo viajan medicoId y fechaHora. El
      // back toma el pacienteId del token y deja el turno Pendiente.
      const fechaHora = new Date(`${fecha}T${horario}:00`).toISOString();
      await apiFetch<Turno>("/turnos", {
        method: "POST",
        body: JSON.stringify({ medicoId: medico.id, fechaHora }),
      });
      navigate("/mis-turnos", { state: { turnoCreado: true } });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "No se pudo pedir el turno");
      // 409: otro paciente tomó el horario mientras tanto. Se vuelven a pedir
      // los ocupados y se deselecciona.
      if (err instanceof ApiError && err.status === 409) {
        setHorario("");
        setRecargarOcupados((n) => n + 1);
      }
    } finally {
      setEnviando(false);
    }
  };

  const cargando = cargandoEsp || cargandoMed;

  return (
    <Layout>
      <Container className="pedir-turno">
        <EncabezadoPagina
          titulo="Pedir turno"
          etiqueta="Nueva consulta"
          icono={<CalendarPlus />}
          descripcion="Elegí la especialidad, el profesional y el horario que te quede cómodo. Atendemos de lunes a viernes."
        />

        {cargando ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" aria-label="Cargando especialidades" />
          </div>
        ) : (
          <div className="pedir-turno-layout">
            <div className="pedir-turno-pasos">
              <Paso numero={1} titulo="¿Qué especialidad necesitás?" listo={!!especialidadElegida}>
                <div className="pedir-opciones" role="group" aria-label="Especialidades">
                  {(especialidadesAPI ?? []).map((esp) => (
                    <button
                      key={esp}
                      type="button"
                      className={`pedir-opcion${esp === especialidadElegida ? " pedir-opcion-elegida" : ""}`}
                      aria-pressed={esp === especialidadElegida}
                      onClick={() => elegirEspecialidad(esp)}
                    >
                      {esp}
                    </button>
                  ))}
                </div>
              </Paso>

              <Paso numero={2} titulo="Elegí el profesional" listo={!!medico}>
                {!especialidadElegida ? (
                  <p className="pedir-ayuda">Primero elegí una especialidad.</p>
                ) : (
                  <div className="pedir-medicos" role="group" aria-label="Profesionales">
                    {medicosDeEspecialidad.map((m) => {
                      const elegido = String(m.id) === medicoElegidoId;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          className={`pedir-medico${elegido ? " pedir-medico-elegido" : ""}`}
                          aria-pressed={elegido}
                          onClick={() => elegirMedico(String(m.id))}
                        >
                          <AvatarIniciales nombre={m.usuario.nombre} apellido={m.usuario.apellido} id={m.id} />
                          <span className="pedir-medico-datos">
                            <span className="pedir-medico-nombre">{m.usuario.nombre} {m.usuario.apellido}</span>
                            <span className="pedir-medico-detalle">{m.especialidad} · Mat. {m.matricula}</span>
                          </span>
                          {elegido && <CheckCircleFill className="pedir-medico-check" aria-hidden="true" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </Paso>

              <Paso numero={3} titulo="Día y horario" listo={!!(fecha && horario)}>
                {/* Los días muestran cuántos horarios libres quedan; los
                    ocupados (RN-002) y los ya pasados no se pueden elegir */}
                <SelectorTurno
                  medicoId={medicoElegidoId}
                  fecha={fecha}
                  hora={horario}
                  onFecha={(f) => {
                    setFecha(f);
                    setHorario("");
                  }}
                  onHora={setHorario}
                  recargar={recargarOcupados}
                />
              </Paso>
            </div>

            {/* ── Resumen ── */}
            <aside className="pedir-resumen" aria-label="Resumen del turno">
              <h2 className="pedir-resumen-titulo">Tu turno</h2>
              <dl className="pedir-resumen-lista">
                <div>
                  <dt>Especialidad</dt>
                  <dd>{especialidadElegida || <span className="pedir-resumen-falta">Sin elegir</span>}</dd>
                </div>
                <div>
                  <dt>Profesional</dt>
                  <dd>{medico ? `${medico.usuario.nombre} ${medico.usuario.apellido}` : <span className="pedir-resumen-falta">Sin elegir</span>}</dd>
                </div>
                <div>
                  <dt>Día</dt>
                  <dd className="pedir-resumen-capital">
                    {fecha ? FECHA_RESUMEN.format(new Date(`${fecha}T00:00:00`)) : <span className="pedir-resumen-falta">Sin elegir</span>}
                  </dd>
                </div>
                <div>
                  <dt>Horario</dt>
                  <dd>{horario ? `${horario} h` : <span className="pedir-resumen-falta">Sin elegir</span>}</dd>
                </div>
                {cobertura && (
                  <div>
                    <dt>Cobertura</dt>
                    <dd>{cobertura.obraSocial.nombre} · Plan {cobertura.plan}</dd>
                  </div>
                )}
              </dl>

              {errorMsg && <Alert variant="danger" className="mb-3">{errorMsg}</Alert>}

              <Button variant="primary" size="lg" className="w-100" disabled={!listo || enviando} onClick={confirmarTurno}>
                {enviando ? "Pidiendo turno…" : "Confirmar turno"}
              </Button>

              <p className="pedir-resumen-nota">
                <InfoCircle aria-hidden="true" />
                <span>
                  El turno queda <strong>por confirmar</strong> hasta que el consultorio lo confirme. Mientras tanto
                  lo podés cancelar desde Mis turnos. El día de la consulta traé tu DNI{cobertura ? " y la credencial de tu obra social" : ""}.
                </span>
              </p>
            </aside>
          </div>
        )}
      </Container>
    </Layout>
  );
}

export default PedirTurno;
