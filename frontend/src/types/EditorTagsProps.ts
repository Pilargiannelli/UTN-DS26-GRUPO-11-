interface EditorTagsProps {
    titulo: string;
    tagsIniciales: string[];
    placeholderInput?: string;
    useRolView: (config: { medico: React.ReactNode }) => React.ReactNode;
    onPreGuardar: (tagsActualizados: string[]) => void;
}

interface EditorTagsRef {
  finalizarEdicionExitosamente: () => void;
}

export type { EditorTagsProps, EditorTagsRef };