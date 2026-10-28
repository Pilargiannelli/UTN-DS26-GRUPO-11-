import { Form } from "react-bootstrap";
import type { FieldValues, Path, UseFormRegister } from "react-hook-form";

interface SelectEditableProps<T extends FieldValues> {
    label: string;
    name: Path<T>;
    options: string[];
    register: UseFormRegister<T>;
    error?: string;
}

export function SelectEditable<T extends FieldValues>({ label, name, options, register, error }: SelectEditableProps<T>) {
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