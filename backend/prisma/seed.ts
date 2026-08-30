import { prisma } from "../src/config/prisma";
import { TurnoEstado, DiaSemana } from "../src/generated/prisma/enums";

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
    data: {
      nombre: "Penicilina",
    },
  });

  const alergiaIbuprofeno = await prisma.alergia.create({
    data: {
      nombre: "Ibuprofeno",
    },
  });

  const antecedenteHipertension = await prisma.antecedente.create({
    data: {
      nombre: "Hipertensión arterial familiar",
    },
  });

  const obraSocialOSDE = await prisma.obraSocial.create({
    data: {
      nombre: "OSDE",
    },
  });

  const obraSocialSwissMedical = await prisma.obraSocial.create({
    data: {
      nombre: "Swiss Medical",
    },
  });

  // ==========================================
  // USUARIOS
  // ==========================================

  console.log("🌱 Insertando usuarios base...");

  const usrMedico = await prisma.usuario.create({
    data: {
      username: "dr_gomez",
      contrasena: "hash_password_123",
      nombre: "Carlos",
      apellido: "Gómez",
      dni: "28456789",
      email: "carlos.gomez@clinica.com",
      fotoPerfil: "https://example.com/fotos/dr_gomez.jpg",
    },
  });

  const usrPaciente1 = await prisma.usuario.create({
    data: {
      username: "mflores",
      contrasena: "hash_password_456",
      nombre: "Maria",
      apellido: "Flores",
      dni: "35123456",
      email: "maria.flores@gmail.com",
    },
  });

  const usrPaciente2 = await prisma.usuario.create({
    data: {
      username: "jrodriguez",
      contrasena: "hash_password_789",
      nombre: "Juan",
      apellido: "Rodríguez",
      dni: "40987654",
      email: "juan.rodriguez@gmail.com",
    },
  });

  const usrSecretaria = await prisma.usuario.create({
    data: {
      username: "sec_ana",
      contrasena: "hash_password_sec",
      nombre: "Ana",
      apellido: "Martínez",
      dni: "32111222",
      email: "ana.martinez@clinica.com",
    },
  });

  // ==========================================
  // ROLES
  // ==========================================

  console.log("🌱 Insertando roles...");

  const medico = await prisma.medico.create({
    data: {
      usuario: {
        connect: {
          id: usrMedico.id,
        },
      },
      especialidad: "Cardiología",
      matricula: "MP-45892",
    },
  });

  const paciente1 = await prisma.paciente.create({
    data: {
      usuario: {
        connect: {
          id: usrPaciente1.id,
        },
      },
      fechaNacimiento: new Date("1990-05-14"),
      sexo: "Femenino",
      telefono: "2214567890",
    },
  });

  const paciente2 = await prisma.paciente.create({
    data: {
      usuario: {
        connect: {
          id: usrPaciente2.id,
        },
      },
      fechaNacimiento: new Date("1998-11-20"),
      sexo: "Masculino",
      telefono: "2219876543",
    },
  });

  const secretaria = await prisma.secretaria.create({
    data: {
      usuario: {
        connect: {
          id: usrSecretaria.id,
        },
      },
    },
  });

  // ==========================================
  // COBERTURAS
  // N:M explícita Paciente <-> ObraSocial
  // ==========================================

  console.log("🌱 Insertando coberturas...");

  await prisma.cobertura.create({
    data: {
      paciente: {
        connect: {
          id: paciente1.id,
        },
      },
      obraSocial: {
        connect: {
          id: obraSocialOSDE.id,
        },
      },
      nroAfiliado: "OS-998822-1",
      plan: "210",
      vigente: true,
    },
  });

  await prisma.cobertura.create({
    data: {
      paciente: {
        connect: {
          id: paciente2.id,
        },
      },
      obraSocial: {
        connect: {
          id: obraSocialSwissMedical.id,
        },
      },
      nroAfiliado: "SW-332211-0",
      plan: "Nubial",
      vigente: true,
    },
  });

  // ==========================================
  // AGENDA Y BLOQUEOS
  // ==========================================

  console.log("🌱 Insertando agenda y bloqueos horarios...");

  await prisma.agenda.create({
    data: {
      medico: {
        connect: {
          id: medico.id,
        },
      },
      horariosAtencion: [
        DiaSemana.Lunes,
        DiaSemana.Miercoles,
        DiaSemana.Viernes,
      ],
      intervaloTurno: 30,
    },
  });

  await prisma.bloqueoHorario.create({
    data: {
      medico: {
        connect: {
          id: medico.id,
        },
      },
      desde: new Date("2026-09-02T12:00:00Z"),
      hasta: new Date("2026-09-02T14:00:00Z"),
      motivo: "Ausencia por capacitación",
    },
  });

  // ==========================================
  // HISTORIA CLÍNICA
  // ==========================================

  console.log("🌱 Insertando historias clínicas...");

  const historiaClinica1 = await prisma.historiaClinica.create({
    data: {
      paciente: {
        connect: {
          id: paciente1.id,
        },
      },
      medico: {
        connect: {
          id: medico.id,
        },
      },

      // N:M implícita HistoriaClinica <-> Alergia
      alergias: {
        connect: [
          { id: alergiaPenicilina.id },
          { id: alergiaIbuprofeno.id },
        ],
      },

      // N:M implícita HistoriaClinica <-> Antecedente
      antecedentes: {
        connect: [
          { id: antecedenteHipertension.id },
        ],
      },
    },
  });

  // ==========================================
  // ENTRADAS CLÍNICAS
  // ==========================================

  console.log("🌱 Insertando entradas clínicas...");

  await prisma.entradaClinica.createMany({
    data: [
      {
        historiaClinicaId: historiaClinica1.id,
        diagnostico: "Chequeo de rutina cardiovascular",
        evolucion:
          "Paciente se presenta asintomática. ECG dentro de parámetros normales.",
        observaciones: "Solicitar análisis de laboratorio completo.",
        fecha: new Date("2026-06-10T10:00:00Z"),
      },
      {
        historiaClinicaId: historiaClinica1.id,
        diagnostico: "Seguimiento de rutina",
        evolucion:
          "Resultados de laboratorio normales. Mantener hábitos saludables.",
        observaciones: "Próximo control en 6 meses.",
        fecha: new Date("2026-07-15T11:30:00Z"),
      },
    ],
  });

  // ==========================================
  // TURNOS
  // ==========================================

  console.log("🌱 Insertando turnos...");

  const turno1 = await prisma.turno.create({
    data: {
      medico: {
        connect: {
          id: medico.id,
        },
      },
      paciente: {
        connect: {
          id: paciente1.id,
        },
      },
      secretaria: {
        connect: {
          id: secretaria.id,
        },
      },
      estado: TurnoEstado.Confirmado,
      fechaHora: new Date("2026-08-25T09:00:00Z"),
      pagoValidado: true,
      idWhatsapp: "WA-MSG-100203",
    },
  });

  await prisma.turno.create({
    data: {
      medico: {
        connect: {
          id: medico.id,
        },
      },
      paciente: {
        connect: {
          id: paciente2.id,
        },
      },
      estado: TurnoEstado.Pendiente,
      fechaHora: new Date("2026-08-26T10:30:00Z"),
      pagoValidado: false,
    },
  });

  // ==========================================
  // ASISTENTE IA
  // ==========================================

  console.log("🌱 Insertando Asistente IA...");

  await prisma.asistenteIA.create({
    data: {
      nroWhatsApp: "2214567890",
      turno: {
        connect: {
          id: turno1.id,
        },
      },
    },
  });

  console.log(
    "✅ Seed finalizado exitosamente con datos y relaciones del dominio médico."
  );
}

main()
  .catch((e) => {
    console.error("❌ Error ejecutando el seed:", e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });