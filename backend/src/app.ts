import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import turnoRoutes from "./routes/turno.routes";
import authRoutes from "./routes/auth.routes";
import obraSocialRoutes from "./routes/obraSocial.routes";
import especialidadRoutes from "./routes/especialidad.routes";
import usuarioRoutes from "./routes/usuario.routes";
import { errorHandler } from "./middlewares/error.middleware";

dotenv.config();

const app = express();

const corsOptions = {
  origin: [process.env.FRONTEND_URL ?? "http://localhost:5173"],
};


app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ mensaje: "API de Gestión de Turnos y Pacientes - IMOS Saladillo" });
});

app.use("/api/auth", authRoutes);
app.use("/api/turnos", turnoRoutes);
app.use("/api/obras-sociales", obraSocialRoutes);
app.use("/api/especialidades", especialidadRoutes);
// usuarioRoutes define sus propias rutas en la raíz de /api (/medicos,
// /pacientes, /usuarios) para que coincidan con api.http y la matriz de
// permisos. Montarlo en "/api/usuarios" las dejaba en /api/usuarios/medicos.
app.use("/api", usuarioRoutes);
app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use(errorHandler);

export default app;
