import { Form } from "react-bootstrap";
import type { UseFormRegister } from "react-hook-form";

interface SelectEditableProps {
    label: string;
    name: string;
    options: string[];
    register: UseFormRegister<any>;
    error?: string;
}

export function SelectEditable({ label, name, options, register, error }: SelectEditableProps) {
    return (
        <Form.Group>
            <Form.Label className="d-flex me-auto text-xs mb-1">{label}</Form.Label>
            <Form.Select 
                {...register(name)} 
                isInvalid={!!error}
                className="text-sm"
            >
                <option value="">Seleccione una opción...</option>
                {options.map((opt, idx) => (
                    <option key={idx} value={opt}>
                        {opt}
                    </option>
                ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
                {error}
            </Form.Control.Feedback>
        </Form.Group>
    );
}