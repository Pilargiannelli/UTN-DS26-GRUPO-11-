import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { registroSchema, loginSchema, cambioPasswordSchema } from "../validations/auth.validation";

const router = Router();

router.post("/registro", validate(registroSchema), authController.registro);
// Límite de intentos fallidos de login por IP, contra la fuerza bruta. Los
// logins correctos no cuentan (skipSuccessfulRequests). LOGIN_RATE_LIMIT
// permite bajarlo en los tests.
const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.LOGIN_RATE_LIMIT ?? 10),
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Demasiados intentos de inicio de sesión. Probá de nuevo en 15 minutos." },
});

router.post("/login", limiteLogin, validate(loginSchema), authController.login);
router.get("/yo", authenticate, authController.yo);
// Cada usuario cambia su propia contraseña (el id sale del token)
router.patch("/password", authenticate, validate(cambioPasswordSchema), authController.cambiarPassword);

export default router;
