export type SexoPaciente = "Hombre" | "Mujer" | "Otro" | "";

export interface Paciente {
    id?: string;
    dni: string;
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    nacionalidad: string;
    sexo: SexoPaciente;
    telefono: string;
    email: string;
    direccion: string;
    ciudad: string;
    obraSocial: string;
    numeroAfiliado: string;
    plan: string;
    }