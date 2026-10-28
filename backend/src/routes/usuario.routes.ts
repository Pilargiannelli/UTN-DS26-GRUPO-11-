import { Router } from "express";
import * as usuarioController from "../controllers/usuario.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { Rol } from "../generated/prisma/enums";
import { validate, validateParams } from "../middlewares/validate.middleware";
import { pacienteCreateSchema } from "../validations/paciente.validation";
import { idParamSchema } from "../validations/turno.validation";

const router = Router();

// GET /api/medicos -> PÚBLICO (según Matriz de Permisos sección 7)
router.get("/medicos", usuarioController.getMedicos);

// GET /api/pacientes -> Exige token y rol SECRETARIA o MEDICO (sección 6)
router.get("/pacientes", authenticate, authorize(Rol.SECRETARIA, Rol.MEDICO), usuarioController.getPacientes);

// POST /api/pacientes -> alta de paciente por la secretaria (HU-001: "como
// personal administrativo"). Crea Usuario + Paciente; usuario y contraseña
// inicial = DNI.
router.post("/pacientes", authenticate, authorize(Rol.SECRETARIA), validate(pacienteCreateSchema), usuarioController.createPaciente);

// PUT /api/pacientes/:id -> editar los datos (sección 6). El paciente, solo los
// suyos: eso lo verifica el service.
router.put(
  "/pacientes/:id",
  authenticate,
  authorize(Rol.SECRETARIA, Rol.MEDICO, Rol.PACIENTE),
  validateParams(idParamSchema),
  validate(pacienteCreateSchema),
  usuarioController.updatePaciente
);

// GET /api/usuarios -> Exige token y rol SECRETARIA o MEDICO
router.get("/usuarios", authenticate, authorize(Rol.SECRETARIA, Rol.MEDICO), usuarioController.getUsuarios);

export default router;