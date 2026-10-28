import { Router, Request, Response, NextFunction } from "express";
import * as turnoController from "../controllers/turno.controller";
import { validate, validateParams } from "../middlewares/validate.middleware";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  turnoCreateSchema,
  turnoSolicitudSchema,
  turnoUpdateSchema,
  idParamSchema,
} from "../validations/turno.validation";
import { Rol } from "../generated/prisma/enums"; // Importamos el Enum oficial

const router = Router();

// Todas las rutas de turnos requieren estar autenticado
router.use(authenticate);

// El paciente pide un turno con { medicoId, fechaHora }; secretaria y médico
// cargan el turno completo (con pacienteId).
const validarAltaTurno = (req: Request, res: Response, next: NextFunction) =>
  validate(req.usuario?.rol === Rol.PACIENTE ? turnoSolicitudSchema : turnoCreateSchema)(req, res, next);

// Los tres roles entran a estas rutas; la titularidad ("✅ propio" en la
// matriz de permisos, sección 8) se resuelve en turno.service, no acá.
const todos = authorize(Rol.MEDICO, Rol.SECRETARIA, Rol.PACIENTE);

router.get("/", todos, turnoController.getAll);
// Antes de "/:id" para que "ocupados" no se tome como un id
router.get("/ocupados", todos, turnoController.getOcupados);
router.get("/:id", todos, validateParams(idParamSchema), turnoController.getById);
router.post("/", todos, validarAltaTurno, turnoController.create);

// Cancelar = cambio de estado a Cancelado (no borra: queda en el historial)
router.patch("/:id/cancelar", todos, validateParams(idParamSchema), turnoController.cancelar);

// Actualizar / Reprogramar y eliminar: Médico (sólo los suyos) y Secretaria
router.put("/:id", authorize(Rol.MEDICO, Rol.SECRETARIA), validateParams(idParamSchema), validate(turnoUpdateSchema), turnoController.update);
router.delete("/:id", authorize(Rol.MEDICO, Rol.SECRETARIA), validateParams(idParamSchema), turnoController.remove);

export default router;
