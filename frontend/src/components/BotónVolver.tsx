import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import "../assets/styles/BotonVolver.css"

export function BotonVolver() {
    const navigate = useNavigate();
    return (
        <div className="contenedor-volver">
            <Button className="btn-volver" type="button" onClick={() => navigate(-1)} >
                Volver
            </Button>
        </div>
    );
}