import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/BotonAgregar.css";

interface BotonAgregarProps {
    // Hoy solo se registran pacientes (no hay POST /medicos ni /usuarios)
    rol: "paciente";
}

export function BotonAgregar({ rol }: BotonAgregarProps) {
    const navigate = useNavigate();
    return (
        <div className="add-button-container">
            <button className="add-button" onClick={() => navigate(`/registrar-${rol}`)} aria-label={`Registrar nuevo ${rol}`}>
                <Plus size={32} strokeWidth={2.8} className="signo-mas" aria-hidden="true"/>
                <span className="add-tooltip"> Registrar nuevo {rol} </span>
            </button>
        </div>
    );
}
