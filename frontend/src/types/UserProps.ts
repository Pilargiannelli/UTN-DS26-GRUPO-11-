interface UserProps {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  foto?: string;
  rol: "medico"|"paciente"|"admin";
}

export type { UserProps };