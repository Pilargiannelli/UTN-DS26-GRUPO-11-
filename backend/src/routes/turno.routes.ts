import { Router } from "express";
import * as turnoController from "../controllers/turno.controller";
import { validate, validateParams } from "../middlewares/validate.middleware";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  turnoCreateSchema,
  turnoUpdateSchema,
  idParamSchema,
} from "../validations/turno.validation";

const router = Router();

// Todas las rutas de turnos requieren estar autenticado
router.use(authenticate);

// Listar todos los turnos (Médico y Administrativo)
router.get("/", authorize("Medico", "Administrativo"), turnoController.getAll);

// Obtener turno por ID (Médico y Administrativo)
router.get("/:id", authorize("Medico", "Administrativo"), validateParams(idParamSchema), turnoController.getById);

// Crear un nuevo turno (Administrativo)
router.post("/", authorize("Administrativo"), validate(turnoCreateSchema), turnoController.create);

// Actualizar / Reprogramar un turno (Médico y Administrativo)
router.put("/:id", authorize("Medico", "Administrativo"), validateParams(idParamSchema), validate(turnoUpdateSchema), turnoController.update);

// Cancelar / Eliminar un turno (Médico y Administrativo)
router.delete("/:id", authorize("Medico", "Administrativo"), validateParams(idParamSchema), turnoController.remove);

export default router;