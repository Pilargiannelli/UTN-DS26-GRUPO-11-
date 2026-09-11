// El schema.prisma es la única fuente de verdad para la forma de Usuario, Medico y Paciente.
// Acá sólo le ponemos el nombre corto que usan services y controllers.
export type { UsuarioModel as Usuario, MedicoModel as Medico, PacienteModel as Paciente } from "../generated/prisma/models";