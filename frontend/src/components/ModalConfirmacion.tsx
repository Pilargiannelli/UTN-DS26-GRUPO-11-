import '../assets/styles/ModalConfirmacion.css';
import type { ModalConfirmacionProps } from '../types/ModalConfirmacionProps.ts';

export function ModalConfirmacion({ isOpen, mensaje, onAceptar, onCancelar }: ModalConfirmacionProps) {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay">
            <div className="modal-box shadow-lg">
                <p className="modal-mensaje">{mensaje}</p>
                <div className="modal-acciones">
                    <button className="btn-modal btn-cancelar" onClick={onCancelar}> Cancelar </button>
                    <button className="btn-modal btn-aceptar" onClick={onAceptar}> Aceptar </button>
                </div>
            </div>
        </div>
    );
}