import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout/Layout.tsx";
import { BotonVolver } from "../components/BotonVolver.tsx";
import { useFetch } from "../hooks/useFetch";
import "../assets/styles/PedirTurno.css";
import "../assets/styles/PaginaPaciente.css";

interface UsuarioJson {
  rol: string;
  docs: {
    nombre: string;
    apellido: string;
    especialidad?: string;
  };
}

const horariosDisponibles = ["09:00", "10:30", "11:15", "14:00", "15:30"];

function PedirTurno() {
  const navigate = useNavigate();
  const { data: especialidades } = useFetch<string[]>("/especialidades.json");
  const { data: usuarios } = useFetch<UsuarioJson[]>("/users.json");

  const [especialidad, setEspecialidad] = useState("");
  const [medico, setMedico] = useState("");
  const [fecha, setFecha] = useState("");
  const [horario, setHorario] = useState("");

  const medicos = (usuarios ?? []).filter(
    (u) => u.rol === "medico" && u.docs.especialidad === especialidad
  );

  const puedeConfirmar = especialidad && medico && fecha && horario;

  const confirmarTurno = () => {
    // Acá va la llamada real a la API cuando exista un endpoint de turnos.
    navigate("/mis-turnos");
  };

  return (
    <Layout>
      <div className="pagina-paciente">
        <BotonVolver />

        <p className="pedir-turno-titulo">Agendar una consulta</p>

        <div className="pedir-turno-card">

          <label className="pedir-turno-label">Especialidad</label>
          <select
            className="pedir-turno-select"
            value={especialidad}
            onChange={(e) => {
              setEspecialidad(e.target.value);
              setMedico("");
            }}
          >
            <option value="">Elegí una especialidad</option>
            {(especialidades ?? []).map((esp) => (
              <option key={esp} value={esp}>{esp}</option>
            ))}
          </select>

          <label className="pedir-turno-label">Profesional</label>
          <select
            className="pedir-turno-select"
            value={medico}
            onChange={(e) => setMedico(e.target.value)}
            disabled={!especialidad}
          >
            <option value="">
              {especialidad ? "Elegí un profesional" : "Elegí primero una especialidad"}
            </option>
            {medicos.map((m) => (
              <option key={`${m.docs.nombre}-${m.docs.apellido}`} value={`${m.docs.nombre} ${m.docs.apellido}`}>
                {m.docs.nombre} {m.docs.apellido}
              </option>
            ))}
          </select>

          <label className="pedir-turno-label">Fecha</label>
          <input
            type="date"
            className="pedir-turno-select"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />

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

          <button
            className="pedir-turno-btn-confirmar"
            disabled={!puedeConfirmar}
            onClick={confirmarTurno}
          >
            Confirmar consulta
          </button>

        </div>
      </div>
    </Layout>
  );
}

export default PedirTurno;