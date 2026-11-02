import { Button, Modal } from "react-bootstrap";
import type { EntradaClinica } from "../../types/HistoriaClinica";
import "../../assets/styles/ConsultaModal.css";

interface ConsultaModalProps {
  entrada: EntradaClinica;
  onCerrar: () => void;
}

const FECHA_LARGA = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric" });

// Una consulta completa, solo lectura (la historia clínica es inalterable).
export function ConsultaModal({ entrada, onCerrar }: ConsultaModalProps) {
  return (
    <Modal show onHide={onCerrar} centered size="lg" dialogClassName="modal-consulta">
      <Modal.Header closeButton closeLabel="Cerrar">
        <Modal.Title as="h3">Consulta</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="consulta-modal-fecha">{FECHA_LARGA.format(new Date(entrada.fecha))}</p>
        <dl className="consulta-modal-datos">
          <dt>Título (diagnóstico)</dt>
          <dd>{entrada.diagnostico}</dd>
          <dt>Evolución</dt>
          <dd>{entrada.evolucion}</dd>
          <dt>Observaciones</dt>
          <dd>{entrada.observaciones || "—"}</dd>
        </dl>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onCerrar}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
}
