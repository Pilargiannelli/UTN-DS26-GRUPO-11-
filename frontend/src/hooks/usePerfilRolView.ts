import { useAuth } from "../hooks/useAuth";
import type { Usuario } from "../types/Usuario";

type RolPerfilComponents = {
  [rolEspectador: string]: {
    [rolPerfil: string]: React.ReactNode;
  };
};

export function usePerfilRolView(usuario?: Usuario, componentesPorRol?: RolPerfilComponents) {
  const { rol: rolEspectador } = useAuth();
  const rolPerfil = usuario?.rol;

  if (!rolEspectador || !rolPerfil || !componentesPorRol) return null;

  return componentesPorRol[rolEspectador]?.[rolPerfil] || null;
}
