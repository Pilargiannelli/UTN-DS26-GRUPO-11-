import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mismo shape que frontend/src/types/Turno.ts
interface Turno {
  id: number;
  paciente: string;
  medico: string;
  especialidad: string;
  fecha: string;
  hora: string;
  obraSocial: string;
  estado: "Pendiente" | "Confirmado" | "Cancelado";
}

// Mismos datos que frontend/public/turnos.json
const turnos: Turno[] = [
  {
    id: 1,
    paciente: "Juan Pérez",
    medico: "Dr. Font",
    especialidad: "Traumatología",
    fecha: "2026-07-03",
    hora: "09:00",
    obraSocial: "OSDE",
    estado: "Pendiente",
  },
  {
    id: 2,
    paciente: "Ana López",
    medico: "Dr. Castelli",
    especialidad: "Cardiología",
    fecha: "2026-07-03",
    hora: "09:30",
    obraSocial: "IOMA",
    estado: "Confirmado",
  },
  {
    id: 3,
    paciente: "Carlos Ruiz",
    medico: "Dr. Messi",
    especialidad: "Clínica Médica",
    fecha: "2026-07-03",
    hora: "10:00",
    obraSocial: "PAMI",
    estado: "Cancelado",
  },
];

app.get("/", (_req, res) => {
  res.json({ mensaje: "API de Gestión de Turnos y Pacientes - IMOS Saladillo" });
});

app.get("/turnos", (_req, res) => {
  res.json(turnos);
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
