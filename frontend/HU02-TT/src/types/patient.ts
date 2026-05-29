export type PatientSex = "" | "Hombre" | "Mujer" | "Prefiero no decilo";

export interface Patient {
  id: string;
  dni: string;
  nombre: string;
  apellido: string;
  nacionalidad: string;
  sexo: PatientSex;
  fechaNacimiento: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  obraSocial: string;
  numeroAfiliado: string;
  plan: string;
}

export type EditablePatientFields = Omit<Patient, "id" | "dni">;

export type PatientFormValues = EditablePatientFields & Pick<Patient, "dni">;
