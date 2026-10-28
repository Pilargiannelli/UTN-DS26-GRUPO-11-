import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Spinner } from "react-bootstrap";
import { ConsultaCard } from "./ConsultaCard";
import { Boton } from "./Boton.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../assets/styles/HistorialMedicoCard.css";
import "../assets/styles/ContenedorDatos.css";
import { DesplazadorTabs } from "./DesplazadorTabs.tsx";
import { ContenedorDatos } from "./ContenedorDatos.tsx";
import { EditorTags } from "./EditorTags.tsx";
import { ModalConfirmacion } from "./ModalConfirmacion.tsx";
import type { EditorTagsRef } from "../types/EditorTagsProps.ts";
import { useAuth } from "../hooks/useAuth";
import { useHistoriaClinica } from "../hooks/useHistoriaClinica";

interface HistorialMedicoCardProps {
  // id de Paciente (usuario.paciente.id), no de Usuario
  pacienteId: number;
}

// Historia clínica en el perfil del paciente. El médico ve y edita alergias y
// antecedentes (PUT); el paciente solo la lee. La secretaria no llega acá
// (VerUsuario no la muestra y el back responde 403).
export function HistorialMedicoCard({ pacienteId }: HistorialMedicoCardProps) {
    const { tieneRol } = useAuth();
    const navigate = useNavigate();
    const esMedico = tieneRol("MEDICO");
    const { historia, loading, error, actualizarListas } = useHistoriaClinica(pacienteId);
    const [errorGuardar, setErrorGuardar] = useState<string | null>(null);
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

    // EditorTags muestra los botones de edición solo a quien corresponde
    const soloMedico = ({ medico }: { medico: React.ReactNode }) => (esMedico ? medico : null);

    if (loading) return <div className="historial-card shadow-sm"><Spinner animation="border" size="sm" /></div>;
    if (error) return <div className="historial-card shadow-sm"><Alert variant="danger">{error.message}</Alert></div>;
    if (!historia) return null;

    const abrirModalConfirmacion = (seccion: 'alergias' | 'antecedentes', tituloTexto: string, nuevosTags: string[]) => {
      setModalConfig({
          isOpen: true,
          mensaje: `¿Está seguro que quiere guardar los cambios en ${tituloTexto}?`,
          accion: async () => {
              setModalConfig(prev => ({ ...prev, isOpen: false }));
              setErrorGuardar(null);
              try {
                  await actualizarListas({
                      alergias: seccion === 'alergias' ? nuevosTags : historia.alergias,
                      antecedentes: seccion === 'antecedentes' ? nuevosTags : historia.antecedentes,
                  });
                  (seccion === 'alergias' ? alergiasRef : antecedentesRef).current?.finalizarEdicionExitosamente();
              } catch (err) {
                  setErrorGuardar(err instanceof Error ? err.message : "No se pudieron guardar los cambios");
              }
          }
      });
    };

    const misTabs = [
        {
            label: "Consultas",
            component: (
                <>
                    <div className="consultas-scroll">
                        {historia.entradas.length > 0 ? historia.entradas.map((entrada) => (
                            <ConsultaCard key={entrada.id} entrada={entrada} medico={historia.medicoResponsable} />
                        )) : <p>No hay consultas registradas.</p>}
                    </div>
                    {esMedico && (
                      <div className="my-2">
                        <Boton texto="Nueva consulta" onClick={() => navigate(`/historial?paciente=${pacienteId}`)}/>
                      </div>
                    )}
                </>
            )
        },
        {
            label: "Alergias y Antecedentes",
            component: (
                <div className="consultas-scroll datos-medicos-tab">
                    {errorGuardar && <Alert variant="danger">{errorGuardar}</Alert>}
                    <ContenedorDatos>
                        <EditorTags ref={alergiasRef} titulo="Alergias" tagsIniciales={historia.alergias} placeholderInput="Nueva alergia..."
                        onPreGuardar={(tags) => abrirModalConfirmacion("alergias", "Alergias", tags)} useRolView={soloMedico} />
                    </ContenedorDatos>
                    <ContenedorDatos>
                        <EditorTags ref={antecedentesRef} titulo="Antecedentes Médicos" tagsIniciales={historia.antecedentes} placeholderInput="Nuevo antecedente..."
                        onPreGuardar={(tags) => abrirModalConfirmacion("antecedentes", "Antecedentes Médicos", tags)} useRolView={soloMedico} />
                    </ContenedorDatos>
                </div>
            )
        }
    ];

    return (
        <div className="historial-card shadow-sm">
            <h4>Historia clínica</h4>
            <DesplazadorTabs tabs={misTabs} />
            <ModalConfirmacion isOpen={modalConfig.isOpen} mensaje={modalConfig.mensaje} onAceptar={modalConfig.accion} onCancelar={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} />
        </div>
    );
}
