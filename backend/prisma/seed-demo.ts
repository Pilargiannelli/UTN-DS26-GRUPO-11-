// Datos de la demo: 60 pacientes ficticios con sus turnos y consultas.
//
//   docker exec imos-api npx tsx prisma/seed-demo.ts
//
// A diferencia de seed.ts, NO borra nada: solo agrega lo que falta, así que se
// puede correr dos veces sin duplicar. Lo que ya existe no se pisa (un turno
// cancelado en un ensayo sigue cancelado). No importa seed.ts porque ese
// archivo limpia la base apenas se carga.
import bcrypt from "bcrypt";
import { prisma } from "../src/config/prisma";
import { SALT_ROUNDS } from "../src/config/env";
import { DiaSemana, Rol, TurnoEstado } from "../src/generated/prisma/enums";
import { crearPaciente } from "../src/services/paciente.service";
import { pacienteCreateSchema } from "../src/validations/paciente.validation";

// Solo de desarrollo: cumple la fortaleza que exige el registro
const PASSWORD_DEMO = "DemoImos2026";

// Rango de DNI ficticio: fácil de reconocer y de buscar desde secretaría
const DNI_BASE = 99000001;

const MANANA = "2026-11-03";

// Fechas sin atención: no se dan turnos en feriados
const FERIADOS = ["2026-05-01", "2026-05-25", "2026-06-15", "2026-06-20", "2026-07-09", "2026-07-10", "2026-08-17", "2026-10-12", "2026-11-23", "2026-12-07", "2026-12-08", "2026-12-25"];

// Horarios de la grilla del consultorio, repartidos en todo el día para que la
// agenda de mañana tenga turnos antes y después de la presentación
const HORAS = ["08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"];

const DIAS = [DiaSemana.Domingo, DiaSemana.Lunes, DiaSemana.Martes, DiaSemana.Miercoles, DiaSemana.Jueves, DiaSemana.Viernes, DiaSemana.Sabado];

const LUNES_A_VIERNES = [DiaSemana.Lunes, DiaSemana.Martes, DiaSemana.Miercoles, DiaSemana.Jueves, DiaSemana.Viernes];

// Los mismos profesionales de seed.ts (con sus credenciales) para que la base
// local tenga la cartilla real de la clínica. Los que ya existen no se tocan.
const PROFESIONALES = [
  { username: "dr_castellani", nombre: "Mauricio", apellido: "Castellani", dni: "20111333", email: "mauricio.castellani@clinica.com", password: "Castellani1234", especialidad: "Traumatología", matricula: "MP-51230" },
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

// El mismo catálogo de obras sociales de seed.ts
const OBRAS_SOCIALES = [
  "25JUNIO", "ACEROS PARANA", "ACTIVA SALUD", "AMEBPBA", "AMEMOP", "AMEP", "AMFFA", "APRES CLASSIC", "ATSA",
  "BRINDAR SALUD", "CASA", "COMEI", "CONEXION SALUD-O.S. CAPITANES Y BAQ", "DASU", "ESCRIBANOS (COLEGIO)",
  "FARMACIA (O.S. PERSONAL)", "GALENO ARGENTINA SA", "IOMA", "IOSFA", "JERARQUICOS SALUD", "KRONO - ENSALUD",
  "MEDICUS", "MEDIFE", "OBRA SOCIAL - PERSONAL IND.PETROLEO", "OMMINT", "OSEIV - OSPRERA", "OSPE -NO PMO",
  "OSPE 411-301", "OSPE A406", "OSPEPBA", "OSPERYHRA", "OSPIQYP", "OSPIT", "OSPRERA", "OSPSIP", "OSTCARA",
  "OSUOMRA", "PASTEUR LUIS", "PODER JUDICIAL", "PRIMEDIC", "PROPAGANDA MEDICA", "SANCOR SALUD", "SEROS CHUBUT",
  "SERVICIO PENITENCIARIO FEDERAL", "SINDICATO MADERA", "SIPAS", "SMATA", "TEVE (O.S. PERSONAL DE TV)", "Otra",
];

type Perfil =
  | "nuevo" | "futuro" | "manana" | "atendido" | "frecuente" | "finalizado" | "cancelado" | "multiple"
  | "cuentaFuturo" | "cuentaHistorial" | "cuentaCancelado" | "cuentaConsultas";

type FilaPaciente = [
  nombre: string, apellido: string, sexo: "Femenino" | "Masculino", nacimiento: string,
  obraSocial: string | null, plan: string | null, medico: string | null, perfil: Perfil,
];

// Datos inventados. Los cinco primeros son las cuentas de la demo.
const PACIENTES: FilaPaciente[] = [
  ["Lucía", "Ferreyra", "Femenino", "1996-03-21", "MEDIFE", "Bronce", null, "nuevo"],
  ["Tomás", "Acosta", "Masculino", "1988-07-09", "OSDE", "210", "dr_castellani", "cuentaFuturo"],
  ["Valentina", "Ríos", "Femenino", "1979-11-30", "SANCOR SALUD", "SMG20", "dr_agostino", "cuentaHistorial"],
  ["Martín", "Sosa", "Masculino", "1991-02-17", "IOMA", "Obligatorio", "dr_bertoni", "cuentaCancelado"],
  ["Graciela", "Benítez", "Femenino", "1958-05-06", "GALENO ARGENTINA SA", "Plata", "dr_trofino", "cuentaConsultas"],

  ["Nicolás", "Herrera", "Masculino", "1985-01-12", "Swiss Medical", "SMG20", "dr_castellani", "manana"],
  ["Carolina", "Medina", "Femenino", "1972-08-25", "IOMA", "Obligatorio", "dr_castellani", "frecuente"],
  ["Paula", "Domínguez", "Femenino", "1990-10-03", null, null, "dr_agostino", "manana"],
  ["Sebastián", "Luna", "Masculino", "1983-04-19", "OSDE", "310", "dr_agostino", "atendido"],
  ["Héctor", "Giménez", "Masculino", "1955-12-01", "IOMA", "Obligatorio", "dr_almada", "frecuente"],
  ["Mónica", "Vega", "Femenino", "1961-06-14", "MEDICUS", "Azul", "dr_almada", "manana"],
  ["Rodrigo", "Campos", "Masculino", "1977-09-22", null, null, "dr_almada", "cancelado"],
  ["Silvia", "Paz", "Femenino", "1968-03-30", "GALENO ARGENTINA SA", "Oro", "dr_armendariz", "atendido"],
  ["Federico", "Ojeda", "Masculino", "1981-05-08", "SMATA", "Básico", "dr_armendariz", "manana"],
  ["Julieta", "Ibáñez", "Femenino", "2001-02-11", "Swiss Medical", "SMG02", "dr_bertoni", "manana"],
  ["Ramiro", "Molina", "Masculino", "1994-12-19", null, null, "dr_bertoni", "atendido"],
  ["Agustina", "Ledesma", "Femenino", "1993-07-27", "OSDE", "210", "dr_casalino", "manana"],
  ["Norma", "Cabrera", "Femenino", "1963-01-15", "IOMA", "Obligatorio", "dr_casalino", "finalizado"],
  ["Jorge", "Quiroga", "Masculino", "1959-09-05", "OSUOMRA", "Único", "dr_cordero", "frecuente"],
  ["Patricia", "Vera", "Femenino", "1966-11-11", "SANCOR SALUD", "SMG30", "dr_cordero", "manana"],
  ["Bruno", "Aguirre", "Masculino", "2011-04-02", "OSDE", "210", "dr_croce", "manana"],
  ["Camila", "Núñez", "Femenino", "2009-08-16", "IOMA", "Obligatorio", "dr_croce", "atendido"],
  ["Florencia", "Maidana", "Femenino", "1992-06-29", "MEDIFE", "Plata", "dr_garat", "manana"],
  ["Elena", "Córdoba", "Femenino", "1954-02-23", null, null, "dr_garat", "finalizado"],
  ["Alberto", "Ruiz", "Masculino", "1950-10-10", "IOMA", "Obligatorio", "dr_giustozzi", "frecuente"],
  ["Marta", "Ponce", "Femenino", "1957-04-04", "JERARQUICOS SALUD", "PMI", "dr_giustozzi", "manana"],
  ["Ignacio", "Bravo", "Masculino", "1986-03-13", "OSDE", "310", "dr_lopez", "frecuente"],
  ["Daniela", "Rojas", "Femenino", "1998-09-01", null, null, "dr_lopez", "manana"],
  ["Romina", "Arias", "Femenino", "1987-12-07", "Swiss Medical", "SMG20", "dr_lorden", "manana"],
  ["Natalia", "Godoy", "Femenino", "1995-05-31", "SANCOR SALUD", "SMG20", "dr_lorden", "atendido"],
  ["Gonzalo", "Peralta", "Masculino", "1999-01-26", "IOMA", "Obligatorio", "dr_lmengarelli", "manana"],
  ["Micaela", "Toledo", "Femenino", "2003-07-18", null, null, "dr_lmengarelli", "cancelado"],
  ["Esteban", "Correa", "Masculino", "1975-10-21", "OSDE", "210", "dr_mmengarelli", "manana"],
  ["Lorena", "Figueroa", "Femenino", "1980-02-09", "PODER JUDICIAL", "Titular", "dr_mmengarelli", "atendido"],
  ["Beatriz", "Moreno", "Femenino", "1960-08-12", "IOMA", "Obligatorio", "dr_nauan", "frecuente"],
  ["Claudia", "Sandoval", "Femenino", "1969-03-03", "MEDICUS", "Celeste", "dr_nauan", "manana"],
  ["Victoria", "Cáceres", "Femenino", "1989-04-15", "OSDE", "310", "dr_apineyro", "manana"],
  ["Andrea", "Villalba", "Femenino", "1984-09-28", "IOSFA", "Titular", "dr_apineyro", "multiple"],
  ["Mateo", "Funes", "Masculino", "2019-06-10", "IOMA", "Obligatorio", "dr_mpineyro", "frecuente"],
  ["Emma", "Ayala", "Femenino", "2021-01-22", "OSDE", "210", "dr_mpineyro", "manana"],
  ["Thiago", "Salinas", "Masculino", "2016-11-05", null, null, "dr_mpineyro", "cancelado"],
  ["Benjamín", "Navarro", "Masculino", "2018-03-17", "SANCOR SALUD", "SMG20", "dr_tiberi", "manana"],
  ["Olivia", "Cardozo", "Femenino", "2017-10-08", "MEDIFE", "Bronce", "dr_tiberi", "atendido"],
  ["Ricardo", "Bustos", "Masculino", "1964-07-01", "OSPRERA", "Único", "dr_trofino", "manana"],
  ["Susana", "Gallardo", "Femenino", "1956-12-24", "IOMA", "Obligatorio", "dr_trofino", "manana"],
  ["Pablo", "Ortega", "Masculino", "1978-02-28", "Swiss Medical", "SMG20", "dr_trofino", "manana"],
  ["Laura", "Montenegro", "Femenino", "1982-06-06", null, null, "dr_trofino", "multiple"],
  ["Diego", "Escobar", "Masculino", "1990-08-19", "OSDE", "210", "dr_trofino", "futuro"],
  ["Eduardo", "Vázquez", "Masculino", "1953-01-30", "IOMA", "Obligatorio", "dr_gomez", "frecuente"],
  ["Liliana", "Reyes", "Femenino", "1962-05-17", "OSDE", "310", "dr_gomez", "futuro"],
  ["Oscar", "Miranda", "Masculino", "1967-10-14", "Swiss Medical", "SMG30", "dr_gomez", "cancelado"],
  ["Teresa", "Olmos", "Femenino", "1971-04-26", "MEDIFE", "Plata", "dr_gomez", "multiple"],

  ["Joaquín", "Paredes", "Masculino", "2000-11-14", "OSDE", "210", null, "nuevo"],
  ["Milagros", "Tapia", "Femenino", "1997-01-08", "IOMA", "Obligatorio", null, "nuevo"],
  ["Lautaro", "Roldán", "Masculino", "2002-05-23", null, null, null, "nuevo"],
  ["Sofía", "Cuello", "Femenino", "1993-09-12", "Swiss Medical", "SMG02", null, "nuevo"],
  ["Franco", "Arce", "Masculino", "1987-03-04", "SANCOR SALUD", "SMG20", null, "nuevo"],
  ["Abril", "Soria", "Femenino", "2004-12-30", "MEDIFE", "Bronce", null, "nuevo"],
  ["Gastón", "Mansilla", "Masculino", "1976-06-18", "IOMA", "Obligatorio", null, "nuevo"],
  ["Rocío", "Barrios", "Femenino", "1999-08-02", null, null, null, "nuevo"],
];

// Las cinco cuentas de acceso, vinculadas por posición a los primeros pacientes
const USERNAMES_CUENTAS = ["demo.ferreyra", "demo.acosta", "demo.rios", "demo.sosa", "demo.benitez"];

interface Consulta {
  diagnostico: string;
  evolucion: string;
  observaciones: string;
}

const consulta = (diagnostico: string, evolucion: string, observaciones: string): Consulta => ({ diagnostico, evolucion, observaciones });

// Tres consultas típicas por especialidad: primera vez, control y seguimiento
const CONSULTAS: Record<string, Consulta[]> = {
  "Cardiología": [
    consulta("Chequeo cardiovascular", "ECG con ritmo sinusal, sin alteraciones agudas. Tensión arterial 130/85.", "Solicitar ergometría y laboratorio."),
    consulta("Hipertensión arterial leve", "Ergometría sin signos de isquemia. Se indica dieta hiposódica y actividad física.", "Control de presión domiciliario."),
    consulta("Control de hipertensión", "Registros domiciliarios en rango. Buena tolerancia al tratamiento.", "Continuar tratamiento. Control en 6 meses."),
  ],
  "Traumatología": [
    consulta("Lumbalgia mecánica", "Dolor lumbar sin irradiación. Examen neurológico normal.", "Reposo relativo y kinesiología, 10 sesiones."),
    consulta("Esguince de tobillo grado I", "Edema leve, radiografía sin fracturas.", "Inmovilización funcional por 2 semanas."),
    consulta("Control de evolución", "Mejoría del dolor y de la movilidad.", "Alta progresiva a la actividad habitual."),
  ],
  "Nutrición": [
    consulta("Evaluación nutricional inicial", "IMC 27,4. Se releva alimentación habitual.", "Plan alimentario y registro de comidas."),
    consulta("Sobrepeso en seguimiento", "Descenso de 2 kg. Buena adherencia al plan.", "Sumar actividad física tres veces por semana."),
    consulta("Control nutricional", "Peso estable, laboratorio dentro de parámetros.", "Mantener el plan. Control en 3 meses."),
  ],
  "Cirugía": [
    consulta("Hernia inguinal derecha", "Hernia reductible, sin signos de complicación.", "Solicitar ecografía y prequirúrgico."),
    consulta("Evaluación prequirúrgica", "Estudios sin contraindicaciones.", "Se explica el procedimiento y se firma consentimiento."),
    consulta("Control posquirúrgico", "Herida en buen estado, sin signos de infección.", "Retiro de puntos. Evitar esfuerzos por 30 días."),
  ],
  "Otorrinolaringología": [
    consulta("Sinusitis aguda", "Congestión nasal y dolor facial de 5 días.", "Lavajes nasales. Control en 10 días."),
    consulta("Rinitis alérgica", "Mucosa pálida y estornudos a repetición.", "Solicitar prueba de alergia."),
    consulta("Control de rinitis", "Mejoría de los síntomas con el tratamiento.", "Continuar lavajes nasales."),
  ],
  "Ecografías": [
    consulta("Ecografía abdominal", "Hígado, vesícula y riñones sin particularidades.", "Informe entregado al médico solicitante."),
    consulta("Ecografía tiroidea", "Glándula de tamaño normal. Nódulo de 4 mm sin signos de alarma.", "Repetir en 12 meses."),
    consulta("Ecografía de control", "Sin cambios respecto del estudio anterior.", "Control según indicación médica."),
  ],
  "Ortodoncia y Ortopedia": [
    consulta("Maloclusión clase II", "Apiñamiento dentario. Se toman modelos y radiografías.", "Presupuesto de tratamiento con aparatología fija."),
    consulta("Colocación de aparatología", "Se coloca aparatología fija sin complicaciones.", "Indicaciones de higiene. Control mensual."),
    consulta("Control de ortodoncia", "Buena evolución de la alineación.", "Cambio de arco. Control en 30 días."),
  ],
  "Oftalmología": [
    consulta("Presbicia", "Agudeza visual cercana disminuida, fondo de ojo normal.", "Se indican lentes de lectura."),
    consulta("Cataratas incipientes", "Opacidad leve del cristalino, presión ocular normal.", "Control anual."),
    consulta("Control oftalmológico", "Sin cambios respecto del control anterior.", "Continuar con lubricantes oculares."),
  ],
  "Psiquiatría": [
    consulta("Trastorno de ansiedad", "Refiere insomnio y preocupación persistente.", "Se sugiere psicoterapia."),
    consulta("Seguimiento de ansiedad", "Mejoría parcial del sueño. Sin ideas de riesgo.", "Continuar psicoterapia semanal."),
    consulta("Control psiquiátrico", "Buena evolución, retoma sus actividades habituales.", "Control en 2 meses."),
  ],
  "Ginecología": [
    consulta("Control ginecológico anual", "Examen sin particularidades. Se realiza PAP.", "Solicitar mamografía y ecografía."),
    consulta("Resultados de PAP", "Citología negativa. Mamografía sin hallazgos.", "Próximo control en 12 meses."),
    consulta("Control ginecológico", "Asintomática, ciclos regulares.", "Continuar controles anuales."),
  ],
  "Odontología": [
    consulta("Caries en molar inferior", "Lesión de caries en pieza 36.", "Se programa restauración."),
    consulta("Restauración dental", "Restauración con resina sin complicaciones.", "Control en 6 meses."),
    consulta("Limpieza y control", "Se realiza tartrectomía. Encías en buen estado.", "Reforzar técnica de cepillado."),
  ],
  "Reumatología": [
    consulta("Artralgias en manos", "Dolor e inflamación matinal en articulaciones de las manos.", "Solicitar factor reumatoideo y radiografías."),
    consulta("Artritis reumatoidea", "Laboratorio compatible. Se inicia tratamiento de fondo.", "Control de laboratorio en 3 meses."),
    consulta("Control reumatológico", "Menor rigidez matinal. Laboratorio estable.", "Continuar tratamiento."),
  ],
  "Pediatría": [
    consulta("Control de niño sano", "Peso y talla en percentiles normales. Vacunas al día.", "Control en 6 meses."),
    consulta("Faringitis", "Fiebre de 2 días y odinofagia. Hidratación conservada.", "Reposo y abundante líquido."),
    consulta("Control pediátrico", "Buen estado general. Desarrollo adecuado para la edad.", "Reforzar alimentación saludable."),
  ],
  "Fonoaudiología": [
    consulta("Evaluación del lenguaje", "Dificultad en la articulación de algunos fonemas.", "Sesiones semanales de fonoaudiología."),
    consulta("Seguimiento de dislalia", "Mejor articulación en palabras aisladas.", "Ejercicios en casa todos los días."),
    consulta("Control fonoaudiológico", "Avances sostenidos en lenguaje espontáneo.", "Continuar sesiones quincenales."),
  ],
  "Medicina General": [
    consulta("Control clínico anual", "Examen físico normal. Tensión arterial 120/80.", "Solicitar laboratorio de rutina."),
    consulta("Infección respiratoria alta", "Tos y congestión de 3 días, sin fiebre.", "Reposo e hidratación."),
    consulta("Resultados de laboratorio", "Perfil lipídico levemente elevado.", "Dieta y actividad física. Repetir en 6 meses."),
  ],
};

// La historia de la cuenta "varias consultas" cuenta un seguimiento completo
const CONSULTAS_GRACIELA: Consulta[] = [
  consulta("Diabetes tipo 2", "Glucemia en ayunas 142 mg/dl. Se indica plan alimentario y actividad física.", "Solicitar hemoglobina glicosilada."),
  consulta("Control de diabetes", "Hemoglobina glicosilada 7,2 %. Buena adherencia al plan.", "Control de pie diabético y fondo de ojo."),
  consulta("Hipertensión arterial", "Tensión arterial 150/95 en dos tomas. Sin síntomas.", "Control de presión domiciliario."),
  consulta("Control de hipertensión", "Registros domiciliarios en rango.", "Continuar controles. Repetir laboratorio."),
  consulta("Control clínico semestral", "Glucemia y presión estables. Descenso de 3 kg.", "Próximo control en 6 meses."),
];

const ALERGIAS = ["Penicilina", "Ibuprofeno", "Látex", "Polen", "Mariscos"];
const ANTECEDENTES_ADULTO = ["Hipertensión arterial familiar", "Diabetes tipo 2", "Hipotiroidismo", "Dislipemia", "Tabaquismo", "Apendicectomía"];
const ANTECEDENTES_JOVEN = ["Asma", "Migraña crónica", "Apendicectomía"];

// ==========================================
// FECHAS (siempre en la hora de la clínica)
// ==========================================

const fechaHoraClinica = (fecha: string, hora: string) => new Date(`${fecha}T${hora}:00-03:00`);
const mediodia = (fecha: string) => new Date(`${fecha}T12:00:00Z`);
const sumarDias = (fecha: string, dias: number) => new Date(mediodia(fecha).getTime() + dias * 86400000).toISOString().slice(0, 10);
const diaSemana = (fecha: string) => DIAS[mediodia(fecha).getUTCDay()];

// Semanas contadas desde el último lunes pasado y desde el primero que queda
// lejos de la demo; `i` reparte a cada paciente en un día distinto
const pasado = (semanas: number, i: number) => sumarDias("2026-10-26", i % 5 - 7 * semanas);
const futuro = (semanas: number, i: number) => sumarDias("2026-11-09", i % 5 + 7 * semanas);

const edad = (nacimiento: string) => 2026 - Number(nacimiento.slice(0, 4));

// ==========================================
// PLAN DE TURNOS
// ==========================================

interface TurnoPlan {
  paciente: number;
  medico: string;
  fecha: string;
  hora: string;
  estado: TurnoEstado;
  consulta?: Consulta;
}

function armarPlan(diasPorMedico: Map<string, DiaSemana[]>, especialidades: Map<string, string>) {
  const plan: TurnoPlan[] = [];
  const tomados = new Set<string>();

  const atiende = (medico: string, fecha: string) =>
    diasPorMedico.get(medico)!.includes(diaSemana(fecha)) && !FERIADOS.includes(fecha);

  function agregar(paciente: number, medico: string, fechaBase: string, estado: TurnoEstado, datos?: Consulta) {
    let fecha = fechaBase;
    while (!atiende(medico, fecha)) fecha = sumarDias(fecha, 1);

    // Primer horario libre para el médico y para el paciente
    const inicio = (paciente * 5 + plan.length) % HORAS.length;
    const hora = [...HORAS.slice(inicio), ...HORAS.slice(0, inicio)].find(
      (h) => !tomados.has(`${medico}|${fecha}|${h}`) && !tomados.has(`${paciente}|${fecha}|${h}`)
    );
    if (!hora) throw new Error(`Sin horarios para ${medico} el ${fecha}`);

    tomados.add(`${medico}|${fecha}|${hora}`);
    tomados.add(`${paciente}|${fecha}|${hora}`);
    plan.push({ paciente, medico, fecha, hora, estado, consulta: datos });
  }

  const consultaDe = (medico: string, n: number) => CONSULTAS[especialidades.get(medico)!][n % 3];
  const { Confirmado, Pendiente, Reprogramado, Cancelado } = TurnoEstado;
  const estadosManana = [Confirmado, Pendiente, Confirmado, Reprogramado, Confirmado, Cancelado];

  let nroManana = 0;
  PACIENTES.forEach(([, , , , , , medico, perfil], i) => {
    if (!medico) return;
    const atendido = (semanas: number, n: number) => agregar(i, medico, pasado(semanas, i), Confirmado, consultaDe(medico, n));

    switch (perfil) {
      case "futuro":
        agregar(i, medico, futuro(1, i), Confirmado);
        break;
      case "manana":
        atendido(6, 0);
        agregar(i, medico, MANANA, estadosManana[nroManana++ % estadosManana.length]);
        break;
      case "atendido":
        atendido(9, 0);
        atendido(3, 1);
        break;
      case "frecuente":
        atendido(20, 0);
        atendido(12, 1);
        atendido(4, 2);
        agregar(i, medico, futuro(2, i), Confirmado);
        break;
      case "finalizado":
        // Pasó sin consulta registrada: la app lo muestra como "Finalizado"
        agregar(i, medico, pasado(2, i), Confirmado);
        break;
      case "cancelado":
        agregar(i, medico, pasado(5, i), Cancelado);
        agregar(i, medico, futuro(1, i), Cancelado);
        agregar(i, medico, futuro(3, i), Pendiente);
        break;
      case "multiple":
        agregar(i, medico, futuro(0, i), Pendiente);
        agregar(i, medico, futuro(2, i), Reprogramado);
        agregar(i, medico, futuro(5, i), Confirmado);
        agregar(i, medico === "dr_trofino" ? "dr_casalino" : "dr_trofino", futuro(3, i), Pendiente);
        break;
      case "cuentaFuturo":
        agregar(i, medico, "2026-11-11", Pendiente);
        agregar(i, medico, "2026-11-19", Confirmado);
        break;
      case "cuentaHistorial":
        agregar(i, medico, "2026-06-16", Confirmado, consultaDe(medico, 0));
        agregar(i, medico, "2026-08-11", Confirmado, consultaDe(medico, 1));
        agregar(i, medico, "2026-10-06", Confirmado);
        break;
      case "cuentaCancelado":
        agregar(i, medico, "2026-09-15", Cancelado);
        agregar(i, medico, "2026-11-05", Cancelado);
        agregar(i, medico, "2026-11-12", Cancelado);
        agregar(i, medico, "2026-11-20", Pendiente);
        break;
      case "cuentaConsultas":
        ["2026-03-10", "2026-05-12", "2026-07-07", "2026-08-25", "2026-10-13"].forEach((fecha, n) =>
          agregar(i, medico, fecha, Confirmado, CONSULTAS_GRACIELA[n])
        );
        agregar(i, medico, "2026-11-17", Confirmado);
        break;
    }
  });

  // Cada médico tiene que poder mostrar todas las situaciones: lo que le falte
  // se completa con pacientes compatibles con su especialidad, sin usar las
  // cuentas de la demo (su situación es la de la tabla) ni los pacientes nuevos.
  const compatible = (medico: string, i: number) => {
    const [, , sexo, nacimiento, , , , perfil] = PACIENTES[i];
    if (i < USERNAMES_CUENTAS.length || perfil === "nuevo") return false;
    const anios = edad(nacimiento);
    switch (especialidades.get(medico)) {
      case "Ginecología": return sexo === "Femenino" && anios >= 18;
      case "Pediatría": return anios < 16;
      case "Ortodoncia y Ortopedia": return anios < 30;
      case "Odontología":
      case "Fonoaudiología":
      case "Ecografías": return true;
      default: return anios >= 18;
    }
  };

  // Un paciente no tiene dos turnos el mismo día con el mismo médico
  let cursor = 0;
  const siguientePaciente = (medico: string, fecha: string) => {
    for (let intentos = 0; intentos < PACIENTES.length; intentos++) {
      const i = cursor++ % PACIENTES.length;
      if (compatible(medico, i) && !plan.some((t) => t.paciente === i && t.medico === medico && t.fecha === fecha)) return i;
    }
    throw new Error(`Sin pacientes compatibles para ${medico} el ${fecha}`);
  };

  for (const medico of diasPorMedico.keys()) {
    const turnos = (filtro: (t: TurnoPlan) => boolean) => plan.filter((t) => t.medico === medico && filtro(t)).length;
    const hayFuturo = (t: TurnoPlan) => t.fecha > MANANA && t.estado !== Cancelado;
    // Trofino es el médico que se muestra en la demo: su agenda va más cargada
    const minimoManana = medico === "dr_trofino" ? 7 : 2;

    while (atiende(medico, MANANA) && turnos((t) => t.fecha === MANANA && t.estado !== Cancelado) < minimoManana) {
      agregar(siguientePaciente(medico, MANANA), medico, MANANA, turnos((t) => t.fecha === MANANA) % 2 ? Pendiente : Confirmado);
    }
    while (turnos(hayFuturo) < 2) {
      const n = turnos(hayFuturo);
      const fecha = futuro(n, n);
      agregar(siguientePaciente(medico, fecha), medico, fecha, n % 2 ? Reprogramado : Confirmado);
    }
    while (turnos((t) => !!t.consulta) < 2) {
      const n = turnos((t) => !!t.consulta);
      const fecha = pasado(n + 1, n);
      agregar(siguientePaciente(medico, fecha), medico, fecha, Confirmado, consultaDe(medico, n));
    }
    if (turnos((t) => t.estado === Cancelado) === 0) {
      const fecha = futuro(1, 2);
      agregar(siguientePaciente(medico, fecha), medico, fecha, Cancelado);
    }
  }

  return plan;
}

// Las mismas reglas que aplica la API al crear un turno (salvo "no en el
// pasado": acá hay turnos ya atendidos). Corre antes de escribir en la base.
function validarPlan(plan: TurnoPlan[]) {
  const activos = new Set<string>();
  for (const t of plan) {
    const f = fechaHoraClinica(t.fecha, t.hora);
    const donde = `${t.medico} ${t.fecha} ${t.hora}`;
    if (f.getUTCMinutes() % 30 !== 0) throw new Error(`Fuera de la grilla de 30 minutos: ${donde}`);
    if (["Sabado", "Domingo"].includes(diaSemana(t.fecha))) throw new Error(`Fin de semana: ${donde}`);
    if (t.estado !== TurnoEstado.Cancelado) {
      if (activos.has(donde)) throw new Error(`Médico con dos turnos en el mismo horario: ${donde}`);
      activos.add(donde);
    }
  }
}

// ==========================================
// CARGA
// ==========================================

// Barrera antes de tocar nada: solo corre contra la base local de Docker
function asegurarBaseLocal() {
  const url = new URL(process.env.DATABASE_URL ?? "postgresql://sin-url/");
  const esLocal = ["db", "localhost", "127.0.0.1"].includes(url.hostname) && url.pathname === "/imos_turnos_db";
  if (process.env.NODE_ENV === "production" || !esLocal) {
    throw new Error("seed-demo solo se ejecuta contra la base local de Docker");
  }
}

async function cargarCatalogos() {
  await prisma.obraSocial.createMany({ data: OBRAS_SOCIALES.map((nombre) => ({ nombre })), skipDuplicates: true });

  for (const { password, especialidad, matricula, ...datos } of PROFESIONALES) {
    const existente = await prisma.usuario.findUnique({ where: { email: datos.email } });
    if (existente) continue;
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await prisma.usuario.create({
      data: {
        ...datos,
        passwordHash,
        rol: Rol.MEDICO,
        medico: { create: { especialidad, matricula, agenda: { create: { horariosAtencion: LUNES_A_VIERNES, intervaloTurno: 30 } } } },
      },
    });
  }
}

async function cargarPacientes() {
  const obrasSociales = new Map((await prisma.obraSocial.findMany()).map((o) => [o.nombre, o.id]));
  const ids: number[] = [];
  let creados = 0;

  for (const [i, [nombre, apellido, sexo, nacimiento, obraSocial, plan]] of PACIENTES.entries()) {
    const dni = String(DNI_BASE + i);
    const existente = await prisma.usuario.findUnique({ where: { dni }, include: { paciente: true } });
    if (existente?.paciente) {
      ids.push(existente.paciente.id);
      continue;
    }
    if (existente) throw new Error(`El DNI ${dni} ya es de un usuario que no es paciente`);

    // Pasa por las mismas validaciones y el mismo alta que usa la API
    const usuarioEmail = `${nombre}.${apellido}`.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const datos = pacienteCreateSchema.parse({
      nombre,
      apellido,
      dni,
      email: `${usuarioEmail}@example.com`,
      telefono: `2344${550000 + i * 137}`,
      sexo,
      fechaNacimiento: nacimiento,
      ...(obraSocial && plan && {
        cobertura: { obraSocialId: obrasSociales.get(obraSocial), nroAfiliado: `${700100 + i * 7}-${i % 10}`, plan },
      }),
    });
    const credenciales = USERNAMES_CUENTAS[i] ? { username: USERNAMES_CUENTAS[i], password: PASSWORD_DEMO } : undefined;
    const paciente = await crearPaciente(datos, credenciales);
    ids.push(paciente.id);
    creados++;
  }
  return { ids, creados };
}

async function cargarTurnos(plan: TurnoPlan[], pacientes: number[], medicos: Map<string, number>, secretariaId: number) {
  let creados = 0;
  let conflictos = 0;

  for (const t of plan) {
    const clave = { medicoId: medicos.get(t.medico)!, pacienteId: pacientes[t.paciente], fechaHora: fechaHoraClinica(t.fecha, t.hora) };
    if (await prisma.turno.findFirst({ where: clave, select: { id: true } })) continue;

    // RN-002 contra lo que ya hay en la base (por ejemplo, un turno de un ensayo)
    if (t.estado !== TurnoEstado.Cancelado) {
      const ocupado = await prisma.turno.findFirst({
        where: { medicoId: clave.medicoId, fechaHora: clave.fechaHora, estado: { not: TurnoEstado.Cancelado } },
        select: { id: true },
      });
      if (ocupado) {
        console.warn(`⚠️  Horario ocupado, se omite: ${t.medico} ${t.fecha} ${t.hora}`);
        conflictos++;
        continue;
      }
    }

    await prisma.turno.create({
      data: {
        ...clave,
        estado: t.estado,
        // Los pendientes los pide el paciente; el resto pasa por la secretaria
        secretariaId: t.estado === TurnoEstado.Pendiente ? null : secretariaId,
        pagoValidado: !!t.consulta,
      },
    });
    creados++;
  }
  return { creados, conflictos };
}

async function cargarHistorias(plan: TurnoPlan[], pacientes: number[], medicos: Map<string, number>) {
  let creadas = 0;

  for (const [i, pacienteId] of pacientes.entries()) {
    const consultas = plan.filter((t) => t.paciente === i && t.consulta);
    if (consultas.length === 0) continue;

    const [, , , nacimiento, , , medicoFila, perfil] = PACIENTES[i];
    let historia = await prisma.historiaClinica.findUnique({ where: { pacienteId } });
    if (!historia) {
      const lista = edad(nacimiento) < 40 ? ANTECEDENTES_JOVEN : ANTECEDENTES_ADULTO;
      const antecedentes = perfil === "cuentaConsultas"
        ? ["Diabetes tipo 2", "Hipertensión arterial familiar", "Hipotiroidismo"]
        : perfil === "frecuente" ? [lista[i % lista.length], lista[(i + 1) % lista.length]] : [lista[i % lista.length]];
      const alergias = perfil === "cuentaConsultas"
        ? ["Penicilina", "Ibuprofeno"]
        : perfil === "cuentaHistorial" || i % 3 === 0 ? [ALERGIAS[i % ALERGIAS.length]] : [];
      const conectar = (nombres: string[]) => nombres.map((nombre) => ({ where: { nombre }, create: { nombre } }));

      historia = await prisma.historiaClinica.create({
        data: {
          pacienteId,
          medicoId: medicos.get(medicoFila ?? consultas[0].medico)!,
          alergias: { connectOrCreate: conectar(alergias) },
          antecedentes: { connectOrCreate: conectar(antecedentes) },
        },
      });
    }

    // La app asocia cada consulta con el turno del mismo día: eso es lo que
    // hace que un turno pasado figure como "Atendido"
    for (const t of consultas) {
      const fecha = fechaHoraClinica(t.fecha, t.hora);
      const existe = await prisma.entradaClinica.findFirst({ where: { historiaClinicaId: historia.id, fecha } });
      if (existe) continue;
      await prisma.entradaClinica.create({ data: { ...t.consulta!, fecha, historiaClinicaId: historia.id } });
      creadas++;
    }
  }
  return creadas;
}

async function main() {
  asegurarBaseLocal();

  console.log("🌱 Completando médicos y obras sociales...");
  await cargarCatalogos();

  const secretaria = await prisma.secretaria.findFirstOrThrow({ where: { usuario: { username: "sec_ana" } } });
  const medicosBase = await prisma.medico.findMany({
    include: { usuario: { select: { username: true } }, agenda: true },
    orderBy: { id: "asc" },
  });
  const medicos = new Map(medicosBase.map((m) => [m.usuario.username, m.id]));
  const especialidades = new Map(medicosBase.map((m) => [m.usuario.username, m.especialidad]));
  const dias = new Map(medicosBase.map((m) => [m.usuario.username, m.agenda?.horariosAtencion ?? LUNES_A_VIERNES]));

  const plan = armarPlan(dias, especialidades);
  validarPlan(plan);

  console.log("🌱 Cargando pacientes...");
  const { ids, creados } = await cargarPacientes();

  console.log("🌱 Cargando turnos e historias clínicas...");
  const turnos = await cargarTurnos(plan, ids, medicos, secretaria.id);
  const entradas = await cargarHistorias(plan, ids, medicos);

  console.log(
    `✅ Demo lista. Plan: ${PACIENTES.length} pacientes, ${plan.length} turnos. ` +
      `Nuevos en esta corrida: ${creados} pacientes, ${turnos.creados} turnos, ${entradas} consultas. ` +
      `Omitidos por horario ocupado: ${turnos.conflictos}.`
  );
}

main()
  .catch((e) => {
    console.error("❌ Error cargando la demo:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
