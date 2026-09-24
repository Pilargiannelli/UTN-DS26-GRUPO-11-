import { Router } from "express";
import * as obraSocialController from "../controllers/obraSocial.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { obraSocialCreateSchema } from "../validations/obraSocial.validation";
import { Rol } from "../generated/prisma/enums";

const router = Router();

// GET /api/obras-sociales: catálogo, cualquiera lo puede consultar
router.get("/", obraSocialController.getAll);

// POST /api/obras-sociales: solo SECRETARIA. Es la contraparte real de la
// autorización visual del Header ("+ Nueva Obra Social" oculto para quien
// no sea SECRETARIA). Sin login -> 401. Logueado sin el rol -> 403.
router.post(
  "/",
  authenticate,
  authorize(Rol.SECRETARIA),
  validate(obraSocialCreateSchema),
  obraSocialController.create
);

export default router;