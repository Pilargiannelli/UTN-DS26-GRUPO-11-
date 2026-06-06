interface ToastProps {
  mensaje: string;
  mostrar: boolean;
  tipo?: string;
  onClose: () => void;
}

export type { ToastProps };