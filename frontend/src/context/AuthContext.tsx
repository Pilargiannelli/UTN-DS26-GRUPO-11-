import { useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContextBase.ts";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [rol, setRol] = useState<string>(
    localStorage.getItem("rol") || "unlogged"
  );

  return (
    <AuthContext.Provider value={{ rol, setRol }}>
      {children}
    </AuthContext.Provider>
  );
};
