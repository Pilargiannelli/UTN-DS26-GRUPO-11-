import { prisma } from "../src/config/prisma";
import { TurnoEstado, DiaSemana } from "../src/generated/prisma/enums";

async function main() {
  console.log("🌱 Limpiando base de datos antes de sembrar...");

  //Limpieza para evitar conflictos de Foreign Keys
  await prisma.asistenteIA.deleteMany();
  await prisma.turno.deleteMany();
  await prisma.entradaClinica.deleteMany();
  await prisma.historiaClinica.deleteMany();
  await prisma.agenda.deleteMany();
  await prisma.secretaria.deleteMany();
  await prisma.paciente.deleteMany();
  await prisma.medico.deleteMany();
  await prisma.usuario.deleteMany();

  console.log("🌱 Insertando usuarios base...");

  //Usuarios
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

  console.log("🌱 Insertando roles (Médico, Paciente, Secretaria)...");

  //Roles vinculados a los usuarios creados
  const medico = await prisma.medico.create({
    data: {
      usuarioId: usrMedico.id,
      especialidad: "Cardiología",
      matricula: "MP-45892",
    },
  });

  const paciente1 = await prisma.paciente.create({
    data: {
      usuarioId: usrPaciente1.id,
      fechaNacimiento: new Date("1990-05-14"),
      nroAfiliado: "OS-998822-1",
      obraSocial: "OSDE",
      plan: "210",
      sexo: "Femenino",
      telefono: "2214567890",
    },
  });

  const paciente2 = await prisma.paciente.create({
    data: {
      usuarioId: usrPaciente2.id,
      fechaNacimiento: new Date("1998-11-20"),
      nroAfiliado: "SW-332211-0",
      obraSocial: "Swiss Medical",
      plan: "Nubial",
      sexo: "Masculino",
      telefono: "2219876543",
    },
  });

  const secretaria = await prisma.secretaria.create({
    data: {
      usuarioId: usrSecretaria.id,
    },
  });

  console.log("🌱 Insertando Agenda e Historias Clínicas...");

  //Agenda médico
  await prisma.agenda.create({
    data: {
      medicoId: medico.id,
      horariosAtencion: [DiaSemana.Lunes, DiaSemana.Miercoles, DiaSemana.Viernes],
      intervaloTurno: 30, // 30 minutos por turno
    },
  });

  //Historia clínica de paciente 1 con entradas
  const historiaClinica1 = await prisma.historiaClinica.create({
    data: {
      pacienteId: paciente1.id,
      medicoId: medico.id,
      alergias: ["Penicilina", "Ibuprofeno"],
      antecedentes: ["Hipertensión arterial familiar"],
    },
  });

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

  console.log("🌱 Insertando Turnos y Asistente IA...");

  //Turnos
  const turno1 = await prisma.turno.create({
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

  const turno2 = await prisma.turno.create({
    data: {
      medicoId: medico.id,
      pacienteId: paciente2.id,
      estado: TurnoEstado.Pendiente,
      fechaHora: new Date("2026-08-26T10:30:00Z"),
      pagoValidado: false,
    },
  });

  //Registro de interacción del Asistente IA con el turno
  await prisma.asistenteIA.create({
    data: {
      nroWhatsApp: "2214567890",
      turnoId: turno1.id,
    },
  });

  console.log("✅ Seed finalizado exitosamente con datos del dominio médico.");
}

main()
  .catch((e) => {
    console.error("❌ Error ejecutando el seed:", e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });