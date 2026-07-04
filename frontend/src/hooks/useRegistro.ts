import { useContext } from "react";
import { RegistroContext } from "../context/RegistroContextBase";

export const useRegistro = () => useContext(RegistroContext);