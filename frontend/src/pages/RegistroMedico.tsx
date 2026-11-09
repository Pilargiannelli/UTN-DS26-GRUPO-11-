import { HeartPulse } from "react-bootstrap-icons";
import { EncabezadoPagina } from "../components/EncabezadoPagina";
import Layout from "../components/Layout/Layout.tsx";
import { RegistroMedicoForm } from "../components/RegistroMedicoForm.tsx";
import { BotonVolver } from "../components/BotonVolver.tsx";

function RegistroMedico() {
    return (
        <Layout>
            <BotonVolver destino="/buscar-medico" />
            <EncabezadoPagina 
                titulo="Registrar médico" 
                etiqueta="Cartilla médica" 
                icono={<HeartPulse />} 
                descripcion="Datos personales, contacto y matrícula profesional del médico." 
            />
            <RegistroMedicoForm />
        </Layout>
    );
}

export default RegistroMedico;