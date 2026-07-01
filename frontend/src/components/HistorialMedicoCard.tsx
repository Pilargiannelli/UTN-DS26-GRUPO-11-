import type { Usuario } from "../types/Usuario";
import type { Consulta } from "../types/ConsultaProps";
import { ConsultaCard } from "./ConsultaCard";
import { useRolView } from "../hooks/useRolView";
import { Boton } from "./Boton.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../assets/styles/HistorialMedicoCard.css"
import { DesplazadorTabs } from "./DesplazadorTabs.tsx";

interface HistorialMedicoCardProps {
  usuario: Usuario;
}

export function HistorialMedicoCard({ usuario }: HistorialMedicoCardProps) {
    const historial = (usuario as Usuario & { docs?: { historial?: { consultas?: Consulta[]; alergias?: string[]; antecedentes?: string[] } } }).docs?.historial;
    const consultas = historial?.consultas ?? [];
    const vistaPorRol = useRolView({
        medico:
        <>
            <Boton texto="Nueva consulta" onClick={() => null}/>
        </>
    });
    // Ordenar por fecha descendente
    const consultasOrdenadas = [...consultas].sort(
        (a: Consulta, b: Consulta) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
    const misTabs = [
        {
            label: "Consultas",
            component: (
                <>
                    <div className="consultas-scroll">
                        {consultasOrdenadas.length > 0 ? ( consultasOrdenadas.map((consulta, i) => (
                            <ConsultaCard key={i} consulta={consulta} />
                        ))) : ( <p>No hay consultas registradas.</p> )}
                    </div>
                    <div className="my-2"> {vistaPorRol} </div>
                </>
            )
        },
        {
            label: "Alergias y Antecedentes",
            component: (
                <div className="consultas-scroll datos-medicos-tab">
                    <div className="bloque-datos">
                        <h5>Alergias</h5>
                        {historial?.alergias && historial.alergias.length > 0 ? (
                            <ul> {historial.alergias.map((alergia, i) => <li key={i}>{alergia}</li>)} </ul>
                        ) : ( <p className="sin-datos">No registra alergias.</p> )}
                    </div>
                    <div className="bloque-datos" style={{ marginTop: '1.5rem' }}>
                        <h5>Antecedentes Médicos</h5>
                        {historial?.antecedentes && historial.antecedentes.length > 0 ? (
                            <ul> {historial.antecedentes.map((antecedente, i) => <li key={i}>{antecedente}</li>)} </ul>
                        ) : ( <p className="sin-datos">No registra antecedentes.</p> )}
                    </div>
                </div>
            )
        }
    ];
    return (
        <div className="historial-card shadow-sm">
            <h4>Historial Médico</h4>
            <DesplazadorTabs tabs={misTabs} />
        </div>
    );
}
