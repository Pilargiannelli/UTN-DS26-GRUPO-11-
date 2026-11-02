import bcrypt from "bcrypt";
import { prisma } from "../src/config/prisma";
import { TurnoEstado, DiaSemana, Rol } from "../src/generated/prisma/enums";

const SALT_ROUNDS = 10;

// Profesionales de la sección "Profesionales" de la landing, con la especialidad de cada uno (agenda de lunes a viernes)
const PROFESIONALES_LANDING = [
  { username: "dr_agostino", nombre: "Mariana", apellido: "Agostino", dni: "30100200", email: "mariana.agostino@clinica.com", password: "Agostino1234", especialidad: "Nutrición", matricula: "MP-52400" },
  { username: "dr_almada", nombre: "Raúl", apellido: "Almada", dni: "30100311", email: "raul.almada@clinica.com", password: "Almada1234", especialidad: "Cardiología", matricula: "MP-52407" },
  { username: "dr_armendariz", nombre: "Alejandro", apellido: "Armendariz", dni: "30100422", email: "alejandro.armendariz@clinica.com", password: "Armendariz1234", especialidad: "Cirugía", matricula: "MP-52414" },
  { username: "dr_bertoni", nombre: "Facundo", apellido: "Bertoni", dni: "30100533", email: "facundo.bertoni@clinica.com", password: "Bertoni1234", especialidad: "Otorrinolaringología", matricula: "MP-52421" },
  { username: "dr_casalino", nombre: "Sandra", apellido: "Casalino", dni: "30100644", email: "sandra.casalino@clinica.com", password: "Casalino1234", especialidad: "Ecografías", matricula: "MP-52428" },
  { username: "dr_cordero", nombre: "Diego", apellido: "Cordero", dni: "30100755", email: "diego.cordero@clinica.com", password: "Cordero1234", especialidad: "Cardiología", matricula: "MP-52435" },
  { username: "dr_croce", nombre: "Adriana", apellido: "Croce", dni: "30100866", email: "adriana.croce@clinica.com", password: "Croce1234", especialidad: "Ortodoncia y Ortopedia", matricula: "MP-52442" },
  { username: "dr_garat", nombre: "Betina", apellido: "Garat", dni: "30100977", email: "betina.garat@clinica.com", password: "Garat1234", especialidad: "Ecografías", matricula: "MP-52449" },
  { username: "dr_giustozzi", nombre: "Verónica", apellido: "Giustozzi", dni: "30101088", email: "veronica.giustozzi@clinica.com", password: "Giustozzi1234", especialidad: "Oftalmología", matricula: "MP-52456" },
  { username: "dr_lopez", nombre: "Gabriel", apellido: "López", dni: "30101199", email: "gabriel.lopez@clinica.com", password: "Lopez1234", especialidad: "Psiquiatría", matricula: "MP-52463" },
  { username: "dr_lorden", nombre: "Alejandra", apellido: "Lorden", dni: "30101310", email: "alejandra.lorden@clinica.com", password: "Lorden1234", especialidad: "Ginecología", matricula: "MP-52470" },
  { username: "dr_lmengarelli", nombre: "Luisina", apellido: "Mengarelli", dni: "30101421", email: "luisina.mengarelli@clinica.com", password: "Mengarelli1234", especialidad: "Odontología", matricula: "MP-52477" },
  { username: "dr_mmengarelli", nombre: "Marcelo", apellido: "Mengarelli", dni: "30101532", email: "marcelo.mengarelli@clinica.com", password: "Mengarelli1234", especialidad: "Odontología", matricula: "MP-52484" },
  { username: "dr_nauan", nombre: "Fara", apellido: "Nauan", dni: "30101643", email: "fara.nauan@clinica.com", password: "Nauan1234", especialidad: "Reumatología", matricula: "MP-52491" },
  { username: "dr_apineyro", nombre: "Alejandro", apellido: "Piñeyro", dni: "30101754", email: "alejandro.pineyro@clinica.com", password: "Pineyro1234", especialidad: "Ginecología", matricula: "MP-52498" },
  { username: "dr_mpineyro", nombre: "Marianela", apellido: "Piñeyro", dni: "30101865", email: "marianela.pineyro@clinica.com", password: "Pineyro1234", especialidad: "Pediatría", matricula: "MP-52505" },
  { username: "dr_tiberi", nombre: "Martina", apellido: "Tiberi", dni: "30101976", email: "martina.tiberi@clinica.com", password: "Tiberi1234", especialidad: "Fonoaudiología", matricula: "MP-52512" },
  { username: "dr_trofino", nombre: "Guillermo", apellido: "Trofino", dni: "30102087", email: "guillermo.trofino@clinica.com", password: "Trofino1234", especialidad: "Medicina General", matricula: "MP-52519" },
];

// Obras sociales con las que trabaja la clínica. OSDE y Swiss Medical se crean más abajo; "Sin obra social" lo agrega el formulario.
const OBRAS_SOCIALES_CLINICA = [
  "25JUNIO",
  "ACEROS PARANA",
  "ACTIVA SALUD",
  "AMEBPBA",
  "AMEMOP",
  "AMEP",
  "AMFFA",
  "APRES CLASSIC",
  "ATSA",
  "BRINDAR SALUD",
  "CASA",
  "COMEI",
  "CONEXION SALUD-O.S. CAPITANES Y BAQ",
  "DASU",
  "ESCRIBANOS (COLEGIO)",
  "FARMACIA (O.S. PERSONAL)",
  "GALENO ARGENTINA SA",
  "IOMA",
  "IOSFA",
  "JERARQUICOS SALUD",
  "KRONO - ENSALUD",
  "MEDICUS",
  "MEDIFE",
  "OBRA SOCIAL - PERSONAL IND.PETROLEO",
  "OMMINT",
  "OSEIV - OSPRERA",
  "OSPE -NO PMO",
  "OSPE 411-301",
  "OSPE A406",
  "OSPEPBA",
  "OSPERYHRA",
  "OSPIQYP",
  "OSPIT",
  "OSPRERA",
  "OSPSIP",
  "OSTCARA",
  "OSUOMRA",
  "PASTEUR LUIS",
  "PODER JUDICIAL",
  "PRIMEDIC",
  "PROPAGANDA MEDICA",
  "SANCOR SALUD",
  "SEROS CHUBUT",
  "SERVICIO PENITENCIARIO FEDERAL",
  "SINDICATO MADERA",
  "SIPAS",
  "SMATA",
  "TEVE (O.S. PERSONAL DE TV)",
  "Otra",
];

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

  await prisma.obraSocial.createMany({
    data: OBRAS_SOCIALES_CLINICA.map((nombre) => ({ nombre })),
    skipDuplicates: true,
  });

  // ==========================================
  // USUARIOS + ROLES
  // ==========================================

  console.log("🌱 Insertando usuarios con contraseña hasheada...");

  const usuariosBase = [
    {
      username: "dr_gomez",
      nombre: "Carlos",
      apellido: "Gómez",
      dni: "28456789",
      email: "carlos.gomez@clinica.com",
      fotoPerfil: null,
      rol: Rol.MEDICO,
      password: "Medico1234",
    },
    {
      username: "dr_castellani",
      nombre: "Mauricio",
      apellido: "Castellani",
      dni: "20111333",
      email: "mauricio.castellani@clinica.com",
      fotoPerfil: null,
      rol: Rol.MEDICO,
      password: "Castellani1234",
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

  const usuariosPorUsername: Record<string, { id: number }> = {};

  for (const { password, ...datos } of usuariosBase) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const usuario = await prisma.usuario.upsert({
      where: { email: datos.email },
      update: {},
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

  // Traumatólogo de la clínica con foto en la sección "Profesionales" de la landing
  const traumatologos = [{ username: "dr_castellani", matricula: "MP-51230" }];

  for (const { username, matricula } of traumatologos) {
    const traumatologo = await prisma.medico.upsert({
      where: { usuarioId: usuariosPorUsername[username].id },
      update: {},
      create: {
        usuarioId: usuariosPorUsername[username].id,
        especialidad: "Traumatología",
        matricula,
      },
    });

    await prisma.agenda.upsert({
      where: { medicoId: traumatologo.id },
      update: {},
      create: {
        medicoId: traumatologo.id,
        horariosAtencion: [
          DiaSemana.Lunes,
          DiaSemana.Martes,
          DiaSemana.Miercoles,
          DiaSemana.Jueves,
          DiaSemana.Viernes,
        ],
        intervaloTurno: 30,
      },
    });
  }

  for (const { password, especialidad, matricula, ...datos } of PROFESIONALES_LANDING) {
    const usuario = await prisma.usuario.upsert({
      where: { email: datos.email },
      update: {},
      create: { ...datos, fotoPerfil: null, rol: Rol.MEDICO, passwordHash: await bcrypt.hash(password, SALT_ROUNDS) },
    });
    const profesional = await prisma.medico.upsert({
      where: { usuarioId: usuario.id },
      update: {},
      create: { usuarioId: usuario.id, especialidad, matricula },
    });
    await prisma.agenda.upsert({
      where: { medicoId: profesional.id },
      update: {},
      create: {
        medicoId: profesional.id,
        horariosAtencion: [DiaSemana.Lunes, DiaSemana.Martes, DiaSemana.Miercoles, DiaSemana.Jueves, DiaSemana.Viernes],
        intervaloTurno: 30,
      },
    });
  }

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
  // HISTORIA CLÍNICA Y ENTRADAS
  // ==========================================

  console.log("🌱 Insertando historia clínica y entradas...");

  const historiaClinica1 = await prisma.historiaClinica.upsert({
    where: { pacienteId: paciente1.id },
    update: {},
    create: {
      pacienteId: paciente1.id,
      medicoId: medico.id,
      alergias: { connect: [{ id: alergiaPenicilina.id }, { id: alergiaIbuprofeno.id }] },
      antecedentes: { connect: [{ id: antecedenteHipertension.id }] },
    },
  });

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
  // TURNOS Y ASISTENTE IA
  // ==========================================

  console.log("🌱 Insertando turnos...");

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