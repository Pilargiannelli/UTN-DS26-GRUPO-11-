import { Router } from "express";
import * as obraSocialController from "../controllers/obraSocial.controller";

const router = Router();

// GET /api/obras-sociales
router.get("/", obraSocialController.getAll);

export default router;