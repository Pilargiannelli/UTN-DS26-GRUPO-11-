import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout/Layout.tsx";
import { BotonVolver } from "../components/BotonVolver.tsx";
import { useFetch } from "../hooks/useFetch";
import { apiFetch } from "../services/api";
import type { MedicoTurno, Turno } from "../types/Turno";
import "../assets/styles/PedirTurno.css";
import "../assets/styles/PaginaPaciente.css";

const horariosDisponibles = ["09:00", "10:30", "11:15", "14:00", "15:30"];

export function PedirTurno() {
    const navigate = useNavigate();

    // Consulta de catálogos reales. GET /api/especialidades manda un
    // array de strings (no hay modelo Especialidad en el schema); GET
    // /api/medicos es público (matriz de permisos, sección 7).
    const { data: especialidadesAPI } = useFetch<string[]>("/especialidades");
    const { data: medicosAPI } = useFetch<MedicoTurno[]>("/medicos");

    const [especialidad, setEspecialidad] = useState("");
    const [medicoId, setMedicoId] = useState("");
    const [fecha, setFecha] = useState("");
    const [horario, setHorario] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const listaEspecialidades = especialidadesAPI ?? [];

    // Filtrar médicos según la especialidad elegida
    const medicosFiltrados = (medicosAPI ?? []).filter(
        (m) => !especialidad || m.especialidad === especialidad
    );

    const puedeConfirmar = especialidad && medicoId && fecha && horario && !loading;

    const confirmarTurno = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            // POST /api/turnos hoy sólo lo permiten SECRETARIA y MEDICO
            // (backend/src/routes/turno.routes.ts): un PACIENTE autenticado
            // recibe 403 acá — es el comportamiento esperado, no un bug de
            // este formulario. pacienteId no viaja porque la sesión de un
            // paciente no expone su propio id de Paciente todavía.
            const fechaHora = new Date(`${fecha}T${horario}:00`).toISOString();

            await apiFetch<Turno>("/turnos", {
                method: "POST",
                body: JSON.stringify({ medicoId: Number(medicoId), fechaHora }),
            });

            navigate("/mis-turnos");
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Error al registrar el turno");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="pagina-paciente">
                <BotonVolver />

                <p className="pedir-turno-titulo">Agendar una consulta</p>

                <div className="pedir-turno-card">
                    {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

                    {/* Especialidad */}
                    <label className="pedir-turno-label">Especialidad</label>
                    <select
                        className="pedir-turno-select"
                        value={especialidad}
                        onChange={(e) => {
                            setEspecialidad(e.target.value);
                            setMedicoId("");
                        }}
                    >
                        <option value="">Elegí una especialidad</option>
                        {listaEspecialidades.map((esp) => (
                            <option key={esp} value={esp}>{esp}</option>
                        ))}
                    </select>

                    {/* Profesional */}
                    <label className="pedir-turno-label">Profesional</label>
                    <select
                        className="pedir-turno-select"
                        value={medicoId}
                        onChange={(e) => setMedicoId(e.target.value)}
                        disabled={!especialidad}
                    >
                        <option value="">
                            {especialidad ? "Elegí un profesional" : "Elegí primero una especialidad"}
                        </option>
                        {medicosFiltrados.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.usuario.apellido}, {m.usuario.nombre}
                            </option>
                        ))}
                    </select>

                    {/* Fecha */}
                    <label className="pedir-turno-label">Fecha</label>
                    <input
                        type="date"
                        className="pedir-turno-select"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                    />

                    {/* Horarios */}
                    <label className="pedir-turno-label">Horarios disponibles</label>
                    <div className="pedir-turno-horarios">
                        {horariosDisponibles.map((h) => (
                            <button
                                key={h}
                                type="button"
                                className={`pedir-turno-chip ${horario === h ? "pedir-turno-chip-activo" : ""}`}
                                onClick={() => setHorario(h)}
                            >
                                {h}
                            </button>
                        ))}
                    </div>

                    {/* Botón de envío */}
                    <button
                        className="pedir-turno-btn-confirmar"
                        disabled={!puedeConfirmar}
                        onClick={confirmarTurno}
                    >
                        {loading ? "Confirmando..." : "Confirmar consulta"}
                    </button>
                </div>
            </div>
        </Layout>
    );
}

export default PedirTurno;