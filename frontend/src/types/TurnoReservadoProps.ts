interface TurnoReservadoProps {
    id: number;
    paciente: string;
    especialidad: string;
    medico: string;
    fecha: string;
    hora: string;
    estado: 'Confirmado' | 'Pendiente' | 'Cancelado';
}

export type { TurnoReservadoProps };