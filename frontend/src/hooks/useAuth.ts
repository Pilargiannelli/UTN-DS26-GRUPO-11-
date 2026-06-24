import { useContext } from "react";
import { AuthContext } from "../context/AuthContextBase.ts";

export const useAuth = () => useContext(AuthContext);