import { Router } from "express";
import * as especialidadController from "../controllers/especialidad.controller";

const router = Router();

// GET /api/especialidades
router.get("/", especialidadController.getAll);

export default router;