import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout/Layout.tsx";
import { BotonVolver } from "../components/BotonVolver.tsx";
import { useFetch } from "../hooks/useFetch";
import { apiFetch } from "../services/api";
import type { Especialidad, Medico } from "../types/Medico";
import "../assets/styles/PedirTurno.css";
import "../assets/styles/PaginaPaciente.css";

const horariosDisponibles = ["09:00", "10:30", "11:15", "14:00", "15:30"];

export function PedirTurno() {
    const navigate = useNavigate();
    
    // Consulta de catálogos y usuarios reales
    const { data: especialidadesAPI } = useFetch<Especialidad[]>("/especialidades");
    const { data: medicosAPI } = useFetch<Medico[]>("/medicos");

    const [especialidad, setEspecialidad] = useState("");
    const [medicoId, setMedicoId] = useState("");
    const [fecha, setFecha] = useState("");
    const [horario, setHorario] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Mapeo seguro de especialidades
    const listaEspecialidades = (especialidadesAPI ?? []).map(e => 
        typeof e === "string" ? e : e.nombre
    );

    // Filtrar médicos según la especialidad elegida
    const medicosFiltrados = (medicosAPI ?? []).filter(
        (m) => !especialidad || m.especialidad === especialidad
    );

    const puedeConfirmar = especialidad && medicoId && fecha && horario && !loading;

    const confirmarTurno = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const payload = {
                medicoId,
                fecha,
                hora: horario,
                estado: "PENDIENTE"
            };

            await apiFetch("/turnos", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            navigate("/mis-turnos");
        } catch (err: any) {
            setErrorMsg(err.message || "Error al registrar el turno");
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
                            <option key={m.id || m.dni} value={m.id || m.dni}>
                                {m.apellido}, {m.nombre}
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