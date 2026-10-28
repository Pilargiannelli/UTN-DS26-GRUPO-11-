import { Router } from "express";
import * as historiaController from "../controllers/historiaClinica.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate, validateParams } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validations/turno.validation";
import { entradaCreateSchema, historiaUpdateSchema } from "../validations/historiaClinica.validation";
import { Rol } from "../generated/prisma/enums";

// Montado en /api/pacientes/:id/historia-clinica. mergeParams: para leer el
// :id del paciente, que está en la ruta del padre.
const router = Router({ mergeParams: true });

// Matriz de permisos §10: la SECRETARIA no accede (403). El paciente solo lee
// la suya (la titularidad la verifica el service).
router.use(authenticate, validateParams(idParamSchema));

router.get("/", authorize(Rol.MEDICO, Rol.PACIENTE), historiaController.getHistoria);
router.put("/", authorize(Rol.MEDICO), validate(historiaUpdateSchema), historiaController.updateHistoria);
router.post("/entradas", authorize(Rol.MEDICO), validate(entradaCreateSchema), historiaController.createEntrada);

export default router;
