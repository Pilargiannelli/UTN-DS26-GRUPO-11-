import { Toast, ToastContainer } from "react-bootstrap";
import type { ToastProps } from "../types/NotifyToastProps.ts";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/styles/App.css';

export function ToastMensaje({ mensaje, mostrar, tipo, onClose }: ToastProps) {
  return (
    <ToastContainer position="top-center" className="p-3">
      <Toast show={mostrar} className={tipo} onClose={onClose} autohide delay={3000}>
        <Toast.Body className="text-white">{mensaje}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
}
