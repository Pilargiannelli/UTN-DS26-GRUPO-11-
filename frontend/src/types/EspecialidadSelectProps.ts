interface EspecialidadSelectProps {
    especialidades: string[];
    value: string;
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export type { EspecialidadSelectProps };