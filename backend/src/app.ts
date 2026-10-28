import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import turnoRoutes from "./routes/turno.routes";
import authRoutes from "./routes/auth.routes";
import obraSocialRoutes from "./routes/obraSocial.routes";
import especialidadRoutes from "./routes/especialidad.routes";
import usuarioRoutes from "./routes/usuario.routes";
import historiaClinicaRoutes from "./routes/historiaClinica.routes";
import { errorHandler } from "./middlewares/error.middleware";

dotenv.config();

const app = express();

const corsOptions = {
  origin: [process.env.FRONTEND_URL ?? "http://localhost:5173"],
};


// En Render la API está detrás de un proxy: sin esto, el límite de intentos de
// login vería la IP del proxy y no la del usuario
app.set("trust proxy", 1);

// Cabeceras de seguridad (y sin "x-powered-by: Express")
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ mensaje: "API de Gestión de Turnos y Pacientes - IMOS Saladillo" });
});

// Para "despertar" el servidor antes de la demo: no toca la base de datos
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/turnos", turnoRoutes);
app.use("/api/obras-sociales", obraSocialRoutes);
app.use("/api/especialidades", especialidadRoutes);
app.use("/api/pacientes/:id/historia-clinica", historiaClinicaRoutes);
// usuarioRoutes define sus propias rutas en la raíz de /api (/medicos,
// /pacientes, /usuarios) para que coincidan con api.http y la matriz de
// permisos. Montarlo en "/api/usuarios" las dejaba en /api/usuarios/medicos.
app.use("/api", usuarioRoutes);
app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use(errorHandler);

export default app;
