import { createContext } from "react";

export interface AuthContextType {
  rol: string;
  setRol: (rol: string) => void;
}

export const AuthContext = createContext<AuthContextType>({
  rol: "unlogged",
  setRol: () => {},
});