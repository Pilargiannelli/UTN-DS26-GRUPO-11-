import { Router } from "express";
import * as usuarioController from "../controllers/usuario.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { Rol } from "../generated/prisma/enums";

const router = Router();

// GET /api/medicos -> PÚBLICO (según Matriz de Permisos sección 7)
router.get("/medicos", usuarioController.getMedicos);

// GET /api/pacientes -> Exige token y rol SECRETARIA o MEDICO (sección 6)
router.get("/pacientes", authenticate, authorize(Rol.SECRETARIA, Rol.MEDICO), usuarioController.getPacientes);

// GET /api/usuarios -> Exige token y rol SECRETARIA o MEDICO
router.get("/usuarios", authenticate, authorize(Rol.SECRETARIA, Rol.MEDICO), usuarioController.getUsuarios);

export default router;