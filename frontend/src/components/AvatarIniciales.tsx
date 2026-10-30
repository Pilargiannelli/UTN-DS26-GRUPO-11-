import "../assets/styles/AvatarIniciales.css";

interface AvatarInicialesProps {
  nombre: string;
  apellido: string;
  // Define el color: la misma persona siempre tiene el mismo
  id: number;
  tamanio?: "md" | "lg" | "xl";
}

const TONOS = ["pino", "info", "accent", "warning"] as const;

// Círculo con las iniciales, en lugar de una foto genérica igual para todos
export function AvatarIniciales({ nombre, apellido, id, tamanio = "md" }: AvatarInicialesProps) {
  const iniciales = `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase();
  return (
    <span className={`avatar-iniciales avatar-iniciales-${tamanio} avatar-iniciales-${TONOS[id % TONOS.length]}`} aria-hidden="true">
      {iniciales}
    </span>
  );
}
