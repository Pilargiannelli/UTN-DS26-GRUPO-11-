import { Form, Spinner } from "react-bootstrap";
import { useFetch } from "../hooks/useFetch";
import { type FieldValues } from "react-hook-form";
import { type SelectEditableProps } from "../types/SelectEditableProps";
import "../assets/styles/Select.css"

export function SelectEditable<T extends FieldValues>({label, name, jsonPath, register, error,}: SelectEditableProps<T>) {
  const { data: options, loading, error: fetchError } = useFetch<string[]>(jsonPath);
  if (loading) return <p><Spinner/></p>;
  if (fetchError) return <p>Error al cargar opciones: {fetchError.message}</p>;
  return (
    <Form.Group className="mb-3" controlId={String(name)}>
      <Form.Label className="d-flex me-auto">{label}</Form.Label>
      <Form.Select {...register(name)} isInvalid={!!error}>
        <option value="">Seleccione una opción</option>
        {options?.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </Form.Select>
      {error && <Form.Text className="text-danger">{error}</Form.Text>}
    </Form.Group>
  );
}
