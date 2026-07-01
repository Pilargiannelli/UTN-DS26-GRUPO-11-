import type { EditorTagsProps, EditorTagsRef } from '../types/EditorTagsProps.ts';
import { forwardRef, useImperativeHandle, useState } from 'react';
import '../assets/styles/PestañaEditarTags.css';

export const EditorTags = forwardRef<EditorTagsRef, EditorTagsProps>(({ titulo, tagsIniciales, placeholderInput = "Agregar nuevo...", useRolView, onPreGuardar }, ref) => {
    const [editando, setEditando] = useState(false);
    const [listaTags, setListaTags] = useState<string[]>(() => [...tagsIniciales]);
    const [nuevoTag, setNuevoTag] = useState('');
    useImperativeHandle(ref, () => ({
        finalizarEdicionExitosamente() { setEditando(false); }
    }));
    const handleAgregar = () => {
        if (!nuevoTag.trim()) return;
        setListaTags([...listaTags, nuevoTag.trim()]);
        setNuevoTag('');
    };
    const handleEliminar = (index: number) => {
        setListaTags(listaTags.filter((_, i) => i !== index));
    };
    const handleCancelar = () => {
        setListaTags(tagsIniciales);
        setEditando(false);
    };
    const botonEditar = useRolView({
        medico: !editando ? ( <button className="btn-editar-tag" onClick={() => setEditando(true)}>Editar</button> ) : null
    });
    const panelEdicion = useRolView({
        medico: editando ? (
            <div className="editor-tags-actions">
                <div className="input-agregar-tag-group">
                    <input type="text" placeholder={placeholderInput} value={nuevoTag} onChange={(e) => setNuevoTag(e.target.value)} />
                    <button className="btn-add-tag" onClick={handleAgregar}>+</button>
                </div>
                <div className="grupo-guardado">
                    <button className="btn-cancelar-cambios" onClick={handleCancelar}> Cancelar </button>
                    <button className="btn-guardar-cambios" onClick={() => onPreGuardar(listaTags)}> Guardar Cambios </button>
                </div>
            </div>
        ) : null
    });
    return (
        <div className="contenedor-editor-tags">
            <div className="card-header-tags">
                <h5 className="contenedor-datos-titulo">{titulo}</h5>
                {botonEditar}
            </div>
            <div className="tags-container-grid">
                {listaTags.length > 0 ? (
                    listaTags.map((tag, i) => (
                        <div key={i} className="tag-item">
                            <span>{tag}</span>
                            {editando && ( <button className="btn-remove-tag" onClick={() => handleEliminar(i)}>×</button> )}
                        </div>
                    ))
                ) : ( <p className="sin-datos">No hay registros cargados.</p> )}
            </div>
            {panelEdicion}
        </div>
    );
});
