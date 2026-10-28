import { Router } from "express";
import * as usuarioController from "../controllers/usuario.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { Rol } from "../generated/prisma/enums";
import { validate } from "../middlewares/validate.middleware";
import { pacienteCreateSchema } from "../validations/paciente.validation";

const router = Router();

// GET /api/medicos -> PÚBLICO (según Matriz de Permisos sección 7)
router.get("/medicos", usuarioController.getMedicos);

// GET /api/pacientes -> Exige token y rol SECRETARIA o MEDICO (sección 6)
router.get("/pacientes", authenticate, authorize(Rol.SECRETARIA, Rol.MEDICO), usuarioController.getPacientes);

// POST /api/pacientes -> alta de paciente por el personal (sección 6, HU-001).
// Crea Usuario + Paciente; usuario y contraseña inicial = DNI.
router.post("/pacientes", authenticate, authorize(Rol.SECRETARIA, Rol.MEDICO), validate(pacienteCreateSchema), usuarioController.createPaciente);

// GET /api/usuarios -> Exige token y rol SECRETARIA o MEDICO
router.get("/usuarios", authenticate, authorize(Rol.SECRETARIA, Rol.MEDICO), usuarioController.getUsuarios);

export default router;