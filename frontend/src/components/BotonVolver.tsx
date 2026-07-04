import { useLocation, useNavigate } from "react-router-dom";
import { Boton } from "./Boton.tsx";
import "../assets/styles/Boton.css"

export function BotonVolver() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const handleVolver = () => {
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