import { describe, it, expect } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "./app";
import { JWT_SECRET } from "./config/env";

// Criterio de aceptación (actividad grupal C21):
//   Dado un usuario con rol PACIENTE (con sesión iniciada),
//   cuando quiere ver la lista de todos los pacientes,
//   entonces la API se lo prohíbe con un 403 (matriz de permisos, sección 6).
describe("GET /api/pacientes", () => {
  it("responde 403 si el usuario es PACIENTE", async () => {
    // Arrange: un token de PACIENTE firmado en el test (sin login, sin DB)
    const token = jwt.sign({ sub: 1, rol: "PACIENTE" }, JWT_SECRET, { expiresIn: "1h" });

    // Act
    const res = await request(app)
      .get("/api/pacientes")
      .set("Authorization", `Bearer ${token}`);

    // Assert
    expect(res.status).toBe(403);
  });
});
