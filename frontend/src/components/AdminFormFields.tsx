import { Form, useForm, type Resolver } from "react-hook-form";
import { useFetch } from "../hooks/useFetch";
import { adminSchema, type AdminValidado } from "../schemas/adminSchema";
import type { Usuario } from "../types/Usuario";
import { CommonFormFields } from "./CommonFormFields";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "react-bootstrap";
import type { AdminEditFormProps } from "../types/UserEditFormProps";


export function AdminFormFields({onSave, onCancel}: AdminEditFormProps<AdminValidado>) {
    const { data: usuariosDB } = useFetch<Usuario[]>("/public/users.json");
    const emailsOcupados = usuariosDB ? usuariosDB.map(u => u?.docs?.email?.trim().toLowerCase()).filter((email): email is string => !!email) : [];
    const schema = adminSchema(emailsOcupados);
    const { register, formState: {errors} } = useForm<AdminValidado>({
        resolver: zodResolver(schema) as Resolver<AdminValidado>,
        mode: "onBlur",
    });
    return (
        <div className="form-container animate-fadeIn text-start p-2">
            <Form noValidate onSubmit={onSave}>
                <CommonFormFields register={register} errors={errors} />
                <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-t">
                    <Button type="button" variant="secondary" size="sm" onClick={onCancel}> Cancelar </Button>
                    <Button type="submit" variant="primary" size="sm"> Confirmar datos </Button>
                </div>
            </Form>
        </div>
    );
}