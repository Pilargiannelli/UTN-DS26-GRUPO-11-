import { Router } from "express";
import * as usuarioController from "../controllers/usuario.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { Rol } from "../generated/prisma/enums";

const router = Router();

// GET /api/medicos (Obtener lista de médicos)
router.get("/medicos", authenticate, usuarioController.getMedicos);

// GET /api/pacientes (Obtener lista de pacientes, solo para SECRETARIA y MEDICO)
router.get("/pacientes", authenticate, authorize(Rol.SECRETARIA, Rol.MEDICO), usuarioController.getPacientes);

// GET /api/usuarios (Obtener lista general de usuarios, solo para SECRETARIA y MEDICO)
router.get("/usuarios", authenticate, authorize(Rol.SECRETARIA, Rol.MEDICO), usuarioController.getUsuarios);

export default router;