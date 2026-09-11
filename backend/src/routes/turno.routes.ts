import { Router } from "express";
import * as turnoController from "../controllers/turno.controller";
import { validate, validateParams } from "../middlewares/validate.middleware";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  turnoCreateSchema,
  turnoUpdateSchema,
  idParamSchema,
} from "../validations/turno.validation";
import { Rol } from "../generated/prisma/enums"; // Importamos el Enum oficial

const router = Router();

// Todas las rutas de turnos requieren estar autenticado
router.use(authenticate);

// Listar todos los turnos (Médico y Secretaria)
router.get("/", authorize(Rol.MEDICO, Rol.SECRETARIA), turnoController.getAll);

// Obtener turno por ID (Médico y Secretaria)
router.get("/:id", authorize(Rol.MEDICO, Rol.SECRETARIA), validateParams(idParamSchema), turnoController.getById);

// Crear un nuevo turno (Secretaria y Médico)
router.post("/", authorize(Rol.SECRETARIA, Rol.MEDICO), validate(turnoCreateSchema), turnoController.create);

// Actualizar / Reprogramar un turno (Médico y Secretaria)
router.put("/:id", authorize(Rol.MEDICO, Rol.SECRETARIA), validateParams(idParamSchema), validate(turnoUpdateSchema), turnoController.update);

// Cancelar / Eliminar un turno (Médico y Secretaria)
router.delete("/:id", authorize(Rol.MEDICO, Rol.SECRETARIA), validateParams(idParamSchema), turnoController.remove);

export default router;