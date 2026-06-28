import { Button } from "react-bootstrap";
import type { BotonProps } from "../types/BotonProps.ts";
import "../assets/styles/Boton.css"

export const Boton: React.FC<BotonProps> = ({texto, onClick}) => {
    return (
        <Button className="custom-btn" type="button" onClick={onClick}>
            {texto}
        </Button>
    );
};