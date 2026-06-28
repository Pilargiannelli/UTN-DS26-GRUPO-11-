import { useNavigate } from "react-router-dom";
import { Boton } from "./Boton.tsx";
import "../assets/styles/Boton.css"

export function BotonVolver() {
    const navigate = useNavigate();
    return (
        <div className="left-btn">
            <Boton texto="Volver" onClick={() => navigate(-1)}/>
        </div>
    );
}