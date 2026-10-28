import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { registroSchema, loginSchema, cambioPasswordSchema } from "../validations/auth.validation";

const router = Router();

router.post("/registro", validate(registroSchema), authController.registro);
router.post("/login", validate(loginSchema), authController.login);
router.get("/yo", authenticate, authController.yo);
// Cada usuario cambia su propia contraseña (el id sale del token)
router.patch("/password", authenticate, validate(cambioPasswordSchema), authController.cambiarPassword);

export default router;
