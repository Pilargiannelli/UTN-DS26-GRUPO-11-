import { useRef, useState } from "react";
import type { Usuario } from "../types/Usuario";
import type { Consulta } from "../types/ConsultaProps";
import { ConsultaCard } from "./ConsultaCard";
import { useRolView } from "../hooks/useRolView";
import { Boton } from "./Boton.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../assets/styles/HistorialMedicoCard.css"
import "../assets/styles/ContenedorDatos.css"
import { DesplazadorTabs } from "./DesplazadorTabs.tsx";
import { ContenedorDatos } from "./ContenedorDatos.tsx";
import { EditorTags } from "./EditorTags.tsx";
import { ModalConfirmacion } from "./ModalConfirmacion.tsx";
import type { EditorTagsRef } from "../types/EditorTagsProps.ts";

interface HistorialMedicoCardProps {
  usuario: Usuario;
}

export function HistorialMedicoCard({ usuario }: HistorialMedicoCardProps) {
    const historial = (usuario as Usuario & { docs?: { historial?: { consultas?: Consulta[]; alergias?: string[]; antecedentes?: string[] } } }).docs?.historial;
    const consultas = historial?.consultas ?? [];
    const [listaAlergias, setListaAlergias] = useState<string[]>(historial?.alergias ?? []);
    const [listaAntecedentes, setListaAntecedentes] = useState<string[]>(historial?.antecedentes ?? []);
    const alergiasRef = useRef<EditorTagsRef>(null);
    const antecedentesRef = useRef<EditorTagsRef>(null);
    const [modalConfig, setModalConfig] = useState<{ 
        isOpen: boolean; 
        mensaje: string; 
        accion: () => void 
    }>({
        isOpen: false,
        mensaje: '',
        accion: () => {},
    });
    const abrirModalConfirmacion = (seccion: 'alergias' | 'antecedentes', tituloTexto: string, nuevosTags: string[]) => {
    setModalConfig({
        isOpen: true,
        mensaje: `¿Está seguro que quiere guardar los cambios en ${tituloTexto}?`,
        accion: () => {
            if (seccion === 'alergias') {
                setListaAlergias(nuevosTags);
                alergiasRef.current?.finalizarEdicionExitosamente();
            } else {
                setListaAntecedentes(nuevosTags);
                antecedentesRef.current?.finalizarEdicionExitosamente();
            }
            setModalConfig(prev => ({ ...prev, isOpen: false }));
        }
    });
  };
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
                    {/* Alergias */}
                    <ContenedorDatos>
                        <EditorTags ref={alergiasRef} titulo="Alergias" tagsIniciales={listaAlergias} placeholderInput="Nueva alergia..." useRolView={useRolView}
                        onPreGuardar={(tags) => abrirModalConfirmacion("alergias", "Alergias", tags)} />
                    </ContenedorDatos>
                    {/* Antecedentes */}
                    <ContenedorDatos>
                        <EditorTags ref={antecedentesRef} titulo="Antecedentes Médicos" tagsIniciales={listaAntecedentes} placeholderInput="Nuevo antecedente..." useRolView={useRolView}
                        onPreGuardar={(tags) => abrirModalConfirmacion("antecedentes", "Antecedentes Médicos", tags)} />
                    </ContenedorDatos>
                </div>
            )
        }
    ];
    return (
        <div className="historial-card shadow-sm">
            <h4>Historial Médico</h4>
            <DesplazadorTabs tabs={misTabs} />
            <ModalConfirmacion isOpen={modalConfig.isOpen} mensaje={modalConfig.mensaje} onAceptar={modalConfig.accion} onCancelar={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} />
        </div>
    );
}
