import bcrypt from "bcrypt";
import { prisma } from "../src/config/prisma";
import { TurnoEstado, DiaSemana, Rol } from "../src/generated/prisma/enums";

const SALT_ROUNDS = 10;

async function main() {
  console.log("🌱 Limpiando base de datos antes de sembrar...");

  // Limpieza en orden inverso a las relaciones para evitar conflictos de FK
  await prisma.asistenteIA.deleteMany();
  await prisma.turno.deleteMany();
  await prisma.entradaClinica.deleteMany();
  await prisma.historiaClinica.deleteMany();
  await prisma.bloqueoHorario.deleteMany();
  await prisma.agenda.deleteMany();
  await prisma.cobertura.deleteMany();
  await prisma.secretaria.deleteMany();
  await prisma.paciente.deleteMany();
  await prisma.medico.deleteMany();
  await prisma.obraSocial.deleteMany();
  await prisma.alergia.deleteMany();
  await prisma.antecedente.deleteMany();
  await prisma.usuario.deleteMany();

  // ==========================================
  // CATÁLOGOS
  // ==========================================

  console.log("🌱 Insertando catálogos...");

  const alergiaPenicilina = await prisma.alergia.create({
    data: { nombre: "Penicilina" },
  });

  const alergiaIbuprofeno = await prisma.alergia.create({
    data: { nombre: "Ibuprofeno" },
  });

  const antecedenteHipertension = await prisma.antecedente.create({
    data: { nombre: "Hipertensión arterial familiar" },
  });

  const obraSocialOSDE = await prisma.obraSocial.create({
    data: { nombre: "OSDE" },
  });

  const obraSocialSwissMedical = await prisma.obraSocial.create({
    data: { nombre: "Swiss Medical" },
  });

  // ==========================================
  // USUARIOS + ROLES
  // Un usuario por rol (MEDICO, SECRETARIA, PACIENTE), con la contraseña
  // hasheada con bcrypt. El rol no lo elige quien se registra: acá lo
  // asignamos nosotros a propósito, como haría @default(PACIENTE) en el
  // registro real.
  // ==========================================

  console.log("🌱 Insertando usuarios con contraseña hasheada...");

  const usuariosBase = [
    {
      username: "dr_gomez",
      nombre: "Carlos",
      apellido: "Gómez",
      dni: "28456789",
      email: "carlos.gomez@clinica.com",
      fotoPerfil: "https://example.com/fotos/dr_gomez.jpg",
      rol: Rol.MEDICO,
      password: "Medico1234",
    },
    {
      username: "sec_ana",
      nombre: "Ana",
      apellido: "Martínez",
      dni: "32111222",
      email: "ana.martinez@clinica.com",
      rol: Rol.SECRETARIA,
      password: "Secretaria1234",
    },
    {
      username: "mflores",
      nombre: "Maria",
      apellido: "Flores",
      dni: "35123456",
      email: "maria.flores@gmail.com",
      rol: Rol.PACIENTE,
      password: "Paciente1234",
    },
    {
      username: "jrodriguez",
      nombre: "Juan",
      apellido: "Rodríguez",
      dni: "40987654",
      email: "juan.rodriguez@gmail.com",
      rol: Rol.PACIENTE,
      password: "Paciente1234",
    },
  ] as const;

  // password se saca del spread ANTES de llegar a Prisma: si viajara dentro
  // de "datos", tsc no se queja (el spread no chequea propiedades sobrantes)
  // y Prisma revienta en runtime con "Unknown argument `password`".
  const usuariosPorUsername: Record<string, { id: number }> = {};

  for (const { password, ...datos } of usuariosBase) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const usuario = await prisma.usuario.upsert({
      where: { email: datos.email },
      update: {}, // upsert = idempotente: correr el seed de nuevo no pisa ni duplica
      create: { ...datos, passwordHash },
    });

    usuariosPorUsername[datos.username] = usuario;
  }

  console.log("🌱 Insertando roles (Médico, Secretaria, Paciente)...");

  const medico = await prisma.medico.upsert({
    where: { usuarioId: usuariosPorUsername["dr_gomez"].id },
    update: {},
    create: {
      usuarioId: usuariosPorUsername["dr_gomez"].id,
      especialidad: "Cardiología",
      matricula: "MP-45892",
    },
  });

  const secretaria = await prisma.secretaria.upsert({
    where: { usuarioId: usuariosPorUsername["sec_ana"].id },
    update: {},
    create: { usuarioId: usuariosPorUsername["sec_ana"].id },
  });

  const paciente1 = await prisma.paciente.upsert({
    where: { usuarioId: usuariosPorUsername["mflores"].id },
    update: {},
    create: {
      usuarioId: usuariosPorUsername["mflores"].id,
      fechaNacimiento: new Date("1990-05-14"),
      sexo: "Femenino",
      telefono: "2214567890",
    },
  });

  const paciente2 = await prisma.paciente.upsert({
    where: { usuarioId: usuariosPorUsername["jrodriguez"].id },
    update: {},
    create: {
      usuarioId: usuariosPorUsername["jrodriguez"].id,
      fechaNacimiento: new Date("1998-11-20"),
      sexo: "Masculino",
      telefono: "2219876543",
    },
  });

  // ==========================================
  // COBERTURAS
  // N:M explícita Paciente <-> ObraSocial
  // ==========================================

  console.log("🌱 Insertando coberturas...");

  await prisma.cobertura.upsert({
    where: {
      pacienteId_obraSocialId: {
        pacienteId: paciente1.id,
        obraSocialId: obraSocialOSDE.id,
      },
    },
    update: {},
    create: {
      pacienteId: paciente1.id,
      obraSocialId: obraSocialOSDE.id,
      nroAfiliado: "OS-998822-1",
      plan: "210",
      vigente: true,
    },
  });

  await prisma.cobertura.upsert({
    where: {
      pacienteId_obraSocialId: {
        pacienteId: paciente2.id,
        obraSocialId: obraSocialSwissMedical.id,
      },
    },
    update: {},
    create: {
      pacienteId: paciente2.id,
      obraSocialId: obraSocialSwissMedical.id,
      nroAfiliado: "SW-332211-0",
      plan: "Nubial",
      vigente: true,
    },
  });

  // ==========================================
  // AGENDA Y BLOQUEOS
  // ==========================================

  console.log("🌱 Insertando agenda y bloqueos horarios...");

  await prisma.agenda.upsert({
    where: { medicoId: medico.id },
    update: {},
    create: {
      medicoId: medico.id,
      horariosAtencion: [DiaSemana.Lunes, DiaSemana.Miercoles, DiaSemana.Viernes],
      intervaloTurno: 30,
    },
  });

  const bloqueoExistente = await prisma.bloqueoHorario.findFirst({
    where: { medicoId: medico.id },
  });

  if (!bloqueoExistente) {
    await prisma.bloqueoHorario.create({
      data: {
        medicoId: medico.id,
        desde: new Date("2026-09-02T12:00:00Z"),
        hasta: new Date("2026-09-02T14:00:00Z"),
        motivo: "Ausencia por capacitación",
      },
    });
  }

  // ==========================================
  // HISTORIA CLÍNICA
  // ==========================================

  console.log("🌱 Insertando historia clínica...");

  const historiaClinica1 = await prisma.historiaClinica.upsert({
    where: { pacienteId: paciente1.id },
    update: {},
    create: {
      pacienteId: paciente1.id,
      medicoId: medico.id,
      // N:M implícitas HistoriaClinica <-> Alergia / Antecedente
      alergias: { connect: [{ id: alergiaPenicilina.id }, { id: alergiaIbuprofeno.id }] },
      antecedentes: { connect: [{ id: antecedenteHipertension.id }] },
    },
  });

  // ==========================================
  // ENTRADAS CLÍNICAS
  // ==========================================

  console.log("🌱 Insertando entradas clínicas...");

  const entradasExistentes = await prisma.entradaClinica.count({
    where: { historiaClinicaId: historiaClinica1.id },
  });

  if (entradasExistentes === 0) {
    await prisma.entradaClinica.createMany({
      data: [
        {
          historiaClinicaId: historiaClinica1.id,
          diagnostico: "Chequeo de rutina cardiovascular",
          evolucion: "Paciente se presenta asintomática. ECG dentro de parámetros normales.",
          observaciones: "Solicitar análisis de laboratorio completo.",
          fecha: new Date("2026-06-10T10:00:00Z"),
        },
        {
          historiaClinicaId: historiaClinica1.id,
          diagnostico: "Seguimiento de rutina",
          evolucion: "Resultados de laboratorio normales. Mantener hábitos saludables.",
          observaciones: "Próximo control en 6 meses.",
          fecha: new Date("2026-07-15T11:30:00Z"),
        },
      ],
    });
  }

  // ==========================================
  // TURNOS
  // ==========================================

  console.log("🌱 Insertando turnos...");

  // idWhatsapp no es @unique: no sirve como where de un upsert. Se busca por
  // el par medico+paciente, que en este seed alcanza para identificar el turno.
  let turno1 = await prisma.turno.findFirst({
    where: { medicoId: medico.id, pacienteId: paciente1.id },
  });

  if (!turno1) {
    turno1 = await prisma.turno.create({
      data: {
        medicoId: medico.id,
        pacienteId: paciente1.id,
        secretariaId: secretaria.id,
        estado: TurnoEstado.Confirmado,
        fechaHora: new Date("2026-08-25T09:00:00Z"),
        pagoValidado: true,
        idWhatsapp: "WA-MSG-100203",
      },
    });
  }

  const turno2Existente = await prisma.turno.findFirst({
    where: { medicoId: medico.id, pacienteId: paciente2.id },
  });

  if (!turno2Existente) {
    await prisma.turno.create({
      data: {
        medicoId: medico.id,
        pacienteId: paciente2.id,
        estado: TurnoEstado.Pendiente,
        fechaHora: new Date("2026-08-26T10:30:00Z"),
        pagoValidado: false,
      },
    });
  }

  // ==========================================
  // ASISTENTE IA
  // ==========================================

  console.log("🌱 Insertando Asistente IA...");

  await prisma.asistenteIA.upsert({
    where: { turnoId: turno1.id },
    update: {},
    create: {
      nroWhatsApp: "2214567890",
      turnoId: turno1.id,
    },
  });

  console.log("✅ Seed finalizado exitosamente con usuarios por rol y datos del dominio médico.");
}

main()
  .catch((e) => {
    console.error("❌ Error ejecutando el seed:", e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
