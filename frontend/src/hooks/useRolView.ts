import { useAuth } from "../hooks/useAuth";

type RolComponents = {
  [rol: string]: React.ReactNode;
};

export function useRolView(componentesPorRol: RolComponents) {
  const { rol } = useAuth();
  if (!rol) return null;
  return componentesPorRol[rol] || null;
}
