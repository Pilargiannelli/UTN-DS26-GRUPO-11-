import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout/Layout.tsx";
import { BotonVolver } from "../components/BotonVolver.tsx";
import { useFetch } from "../hooks/useFetch";
import { apiFetch, ApiError } from "../services/api";
import { useHorariosOcupados } from "../hooks/useHorariosOcupados";
import { HORARIOS_CONSULTORIO, horarioNoDisponible as noDisponibleEn } from "../utils/horarios";
import type { MedicoTurno, Turno } from "../types/Turno";
import "../assets/styles/PedirTurno.css";
import "../assets/styles/PaginaPaciente.css";

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
    const [recargarOcupados, setRecargarOcupados] = useState(0);

    const listaEspecialidades = especialidadesAPI ?? [];

    // Fecha mínima del calendario: hoy, en hora local (YYYY-MM-DD)
    const hoyISO = new Date().toLocaleDateString("en-CA");

    // Un horario no se puede elegir si ya lo tomó otro paciente (RN-002) o si
    // es de hoy y ya pasó (RN-008)
    const ocupados = useHorariosOcupados(medicoId, fecha, recargarOcupados);
    const horarioNoDisponible = (h: string) => noDisponibleEn(fecha, h, ocupados);

    // Filtrar médicos según la especialidad elegida
    const medicosFiltrados = (medicosAPI ?? []).filter(
        (m) => !especialidad || m.especialidad === especialidad
    );

    const puedeConfirmar = especialidad && medicoId && fecha && horario && !loading;

    const confirmarTurno = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            // POST /api/turnos como PACIENTE: solo viajan medicoId y fechaHora.
            // El back toma el pacienteId del token y deja el turno Pendiente.
            const fechaHora = new Date(`${fecha}T${horario}:00`).toISOString();

            await apiFetch<Turno>("/turnos", {
                method: "POST",
                body: JSON.stringify({ medicoId: Number(medicoId), fechaHora }),
            });

            navigate("/mis-turnos", { state: { turnoCreado: true } });
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Error al registrar el turno");
            // 409: otro paciente tomó el horario mientras tanto. Se vuelven a
            // pedir los ocupados y se deselecciona.
            if (err instanceof ApiError && err.status === 409) {
                setHorario("");
                setRecargarOcupados((n) => n + 1);
            }
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
                            setHorario("");
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
                        onChange={(e) => {
                            setMedicoId(e.target.value);
                            setHorario("");
                        }}
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
                        min={hoyISO}
                        value={fecha}
                        onChange={(e) => {
                            setFecha(e.target.value);
                            setHorario("");
                        }}
                    />

                    {/* Horarios */}
                    <label className="pedir-turno-label">Horarios disponibles</label>
                    {!medicoId || !fecha ? (
                        <p className="pedir-turno-ayuda">Elegí un profesional y una fecha para ver los horarios.</p>
                    ) : (
                        <>
                            <div className="pedir-turno-horarios">
                                {HORARIOS_CONSULTORIO.map((h) => {
                                    const noDisponible = horarioNoDisponible(h);
                                    return (
                                        <button
                                            key={h}
                                            type="button"
                                            className={`pedir-turno-chip ${horario === h ? "pedir-turno-chip-activo" : ""} ${noDisponible ? "pedir-turno-chip-ocupado" : ""}`}
                                            onClick={() => setHorario(h)}
                                            disabled={noDisponible}
                                            aria-label={noDisponible ? `${h}, no disponible` : h}
                                        >
                                            {h}
                                        </button>
                                    );
                                })}
                            </div>
                            {HORARIOS_CONSULTORIO.some(horarioNoDisponible) && (
                                <p className="pedir-turno-ayuda">Los horarios tachados ya no están disponibles.</p>
                            )}
                        </>
                    )}

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