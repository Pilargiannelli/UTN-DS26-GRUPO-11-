import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/BotonAgregar.css";

interface BotonAgregarProps {
    rol: "paciente" | "medico" | "admin";
}

export function BotonAgregar({ rol }: BotonAgregarProps) {
    const navigate = useNavigate();
    return (
        <div className="add-button-container">
            <button className="add-button" onClick={() => navigate(`/registrar-${rol}`)}>
                <Plus size={32} strokeWidth={2.8} className="signo-mas"/>
                <span className="add-tooltip"> Registrar nuevo {rol} </span>
            </button>
        </div>
    );
}