import { z } from "zod";

// RN-008: no se dan turnos en el pasado (400, es validación del dato)
const fechaFutura = (fecha: Date) => fecha > new Date();
const MENSAJE_PASADO = "No se pueden pedir turnos en el pasado";

// Campos que el cliente puede mandar en POST/PUT. pagoValidado e idWhatsapp
// no están (SEC-002): los va a escribir el flujo de pago/WhatsApp del back, no
// el cliente. Lo que no se declara acá, z.object lo descarta.
// Base sin refine: en Zod 4, .partial() no se puede usar sobre un schema con
// refinements, así que el refine se agrega aparte en cada variante.
const turnoBaseSchema = z.object({
  // Grilla del consultorio: turnos cada 30 minutos (en punto o y media). Con
  // una grilla fija, comparar la hora exacta alcanza para detectar
  // superposiciones (RN-002).
  fechaHora: z.coerce
    .date({ error: "La fecha y hora del turno son obligatorias" })
    .refine((f) => f.getUTCMinutes() % 30 === 0 && f.getUTCSeconds() === 0 && f.getUTCMilliseconds() === 0, {
      message: "Los turnos son cada 30 minutos (en punto o y media)",
    }),
  estado: z
    .enum(["Pendiente", "Confirmado", "Cancelado", "Reprogramado"])
    .optional(), // el default (Pendiente) lo pone Prisma
  medicoId: z.number().int().positive("El médico es obligatorio"),
  pacienteId: z.number().int().positive("El paciente es obligatorio"),
  secretariaId: z.number().int().positive("El id de la secretaria debe ser positivo").optional(),
});

// POST /api/turnos (secretaria y médico). Un turno nuevo nace Pendiente o
// Confirmado: Cancelado y Reprogramado son cambios sobre uno que ya existe.
export const turnoCreateSchema = turnoBaseSchema
  .extend({ estado: z.enum(["Pendiente", "Confirmado"], { error: "Un turno nuevo solo puede ser Pendiente o Confirmado" }).optional() })
  .refine((d) => fechaFutura(d.fechaHora), {
    message: MENSAJE_PASADO,
    path: ["fechaHora"],
  });

// POST /api/turnos como PACIENTE: solo elige médico y horario. pacienteId sale
// del token y el estado es siempre Pendiente (lo que mande de más se descarta).
export const turnoSolicitudSchema = turnoBaseSchema
  .pick({ fechaHora: true, medicoId: true })
  .refine((d) => fechaFutura(d.fechaHora), { message: MENSAJE_PASADO, path: ["fechaHora"] });

// PUT /api/turnos/:id: todo opcional; si cambia la fecha, tiene que ser futura
export const turnoUpdateSchema = turnoBaseSchema
  .partial()
  .refine((d) => d.fechaHora === undefined || fechaFutura(d.fechaHora), {
    message: MENSAJE_PASADO,
    path: ["fechaHora"],
  });

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("El id debe ser un número positivo"),
});

// GET /api/turnos/ocupados?medicoId=&desde=&hasta= (horarios tomados de un
// médico en un rango, para que PedirTurno no ofrezca los que ya no están)
export const ocupadosQuerySchema = z.object({
  medicoId: z.coerce.number().int().positive("El médico es obligatorio"),
  desde: z.coerce.date({ error: "La fecha 'desde' no es válida" }),
  hasta: z.coerce.date({ error: "La fecha 'hasta' no es válida" }),
});

export type TurnoCreate = z.infer<typeof turnoCreateSchema>;
export type TurnoSolicitud = z.infer<typeof turnoSolicitudSchema>;
export type TurnoUpdate = z.infer<typeof turnoUpdateSchema>;
