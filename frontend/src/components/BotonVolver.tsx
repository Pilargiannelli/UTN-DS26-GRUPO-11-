import { useLocation, useNavigate } from "react-router-dom";
import { Boton } from "./Boton.tsx";
import "../assets/styles/Boton.css"

interface BotonVolverProps {
    destino?: string;
}

export function BotonVolver({ destino }: BotonVolverProps) {
    const navigate = useNavigate();
    const { state } = useLocation();
    const handleVolver = () => {
        if (destino) {
            navigate(destino);
            return;
        }
        switch (state?.from) {
            case "/buscar-paciente":
                navigate("/buscar-paciente");
                break;
            case "/buscar-medico":
                navigate("/buscar-medico");
                break;
            default:
                navigate("/home");
        }
    };
    return (
        <div className="left-btn">
            <Boton texto="Volver" onClick={handleVolver}/>
        </div>
    );
}