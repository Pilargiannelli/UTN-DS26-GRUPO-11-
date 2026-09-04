import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import turnoRoutes from "./routes/turno.routes";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middlewares/error.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ mensaje: "API de Gestión de Turnos y Pacientes - IMOS Saladillo" });
});

app.use("/api/auth", authRoutes);
app.use("/api/turnos", turnoRoutes);

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});

app.use(errorHandler);