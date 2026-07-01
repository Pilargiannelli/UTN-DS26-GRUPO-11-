interface ModalConfirmacionProps {
    isOpen: boolean;
    mensaje: string;
    onAceptar: () => void;
    onCancelar: () => void;
}

export type { ModalConfirmacionProps };