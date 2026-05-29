import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import PatientFormField from "./PatientFormField";
import { EditablePatientFields, Patient, PatientFormValues, PatientSex } from "../types/patient";
import "./PatientEditForm.css";

interface PatientEditFormProps {
  patient: Patient;
  onPatientSaved?: (updatedPatient: Patient) => void;
}

type PatientFormErrors = Partial<Record<keyof EditablePatientFields, string>> & {
  form?: string;
};

type ToastType = "success" | "error";

interface ToastState {
  type: ToastType;
  message: string;
}

const REQUIRED_FIELDS: Array<keyof EditablePatientFields> = [
  "nombre",
  "apellido",
  "nacionalidad",
  "sexo",
  "fechaNacimiento",
  "telefono",
  "email",
  "direccion",
  "obraSocial",
  "numeroAfiliado",
  "plan"
];

const SEX_OPTIONS: Array<{ label: PatientSex; value: PatientSex }> = [
  { label: "Hombre", value: "Hombre" },
  { label: "Mujer", value: "Mujer" },
  { label: "Prefiero no decilo", value: "Prefiero no decilo" }
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HUMAN_NAME_REGEX = /^[\p{L}\s'-]+$/u;
const ADDRESS_REGEX = /^[\p{L}0-9\s#.,/\-]+$/u;
const ALPHANUM_TEXT_REGEX = /^[\p{L}0-9\s.&()\/\-]+$/u;
const AFFILIATE_REGEX = /^[A-Z0-9./-]+$/;

const EMPTY_FORM_VALUES: PatientFormValues = {
  dni: "",
  nombre: "",
  apellido: "",
  nacionalidad: "",
  sexo: "",
  fechaNacimiento: "",
  telefono: "",
  email: "",
  direccion: "",
  ciudad: "",
  obraSocial: "",
  numeroAfiliado: "",
  plan: ""
};

const normalizeSpaces = (value: string) => value.replace(/\s{2,}/g, " ").trimStart();

const formatPhone = (rawValue: string) => {
  const digits = rawValue.replace(/\D/g, "").slice(0, 10);

  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
};

const sanitizeNameLike = (value: string, maxLength: number) =>
  normalizeSpaces(value.replace(/[^\p{L}\s'-]/gu, "")).slice(0, maxLength);

const sanitizeAddress = (value: string) =>
  normalizeSpaces(value.replace(/[^\p{L}0-9\s#.,/\-]/gu, "")).slice(0, 120);

const sanitizeGeneralText = (value: string, maxLength: number) =>
  normalizeSpaces(value.replace(/[^\p{L}0-9\s.&()\/\-]/gu, "")).slice(0, maxLength);

const sanitizeAffiliateNumber = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9./-]/g, "").slice(0, 25);

const validateForm = (values: PatientFormValues): PatientFormErrors => {
  const errors: PatientFormErrors = {};

  REQUIRED_FIELDS.forEach((fieldName) => {
    if (!values[fieldName].trim()) {
      errors[fieldName] = "Este campo es obligatorio.";
    }
  });

  if (values.nombre && (!HUMAN_NAME_REGEX.test(values.nombre) || values.nombre.trim().length < 2)) {
    errors.nombre = "Nombre invalido (minimo 2 letras).";
  }
  if (values.apellido && (!HUMAN_NAME_REGEX.test(values.apellido) || values.apellido.trim().length < 2)) {
    errors.apellido = "Apellido invalido (minimo 2 letras).";
  }
  if (
    values.nacionalidad &&
    (!HUMAN_NAME_REGEX.test(values.nacionalidad) || values.nacionalidad.trim().length < 2)
  ) {
    errors.nacionalidad = "Nacionalidad invalida.";
  }

  if (values.fechaNacimiento) {
    const birthDate = new Date(`${values.fechaNacimiento}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oldestDate = new Date(today);
    oldestDate.setFullYear(today.getFullYear() - 120);

    if (Number.isNaN(birthDate.getTime())) {
      errors.fechaNacimiento = "Fecha invalida.";
    } else if (birthDate > today) {
      errors.fechaNacimiento = "La fecha no puede ser futura.";
    } else if (birthDate < oldestDate) {
      errors.fechaNacimiento = "La fecha no parece valida.";
    }
  }

  const phoneDigits = values.telefono.replace(/\D/g, "");
  if (phoneDigits.length !== 10) {
    errors.telefono = "Telefono invalido (usar 10 digitos).";
  }

  if (values.email.trim() && !EMAIL_REGEX.test(values.email.trim())) {
    errors.email = "Ingresa un email valido.";
  }
  if (values.email.length > 80) {
    errors.email = "El email no puede superar 80 caracteres.";
  }

  if (
    values.direccion &&
    (!ADDRESS_REGEX.test(values.direccion) || values.direccion.trim().length < 5)
  ) {
    errors.direccion = "Direccion invalida (minimo 5 caracteres).";
  }

  if (values.ciudad && (!HUMAN_NAME_REGEX.test(values.ciudad) || values.ciudad.length > 60)) {
    errors.ciudad = "Ciudad invalida.";
  }

  if (
    values.obraSocial &&
    (!ALPHANUM_TEXT_REGEX.test(values.obraSocial) ||
      values.obraSocial.trim().length < 2 ||
      values.obraSocial.length > 80)
  ) {
    errors.obraSocial = "Obra social invalida.";
  }

  if (!values.numeroAfiliado.trim()) {
    errors.numeroAfiliado = "Ingresa el numero de afiliado.";
  } else if (
    values.numeroAfiliado.length < 4 ||
    values.numeroAfiliado.length > 25 ||
    !AFFILIATE_REGEX.test(values.numeroAfiliado)
  ) {
    errors.numeroAfiliado = "Numero de afiliado invalido.";
  }

  if (!values.plan.trim()) {
    errors.plan = "Ingresa el plan.";
  } else if (
    values.plan.length < 2 ||
    values.plan.length > 40 ||
    !ALPHANUM_TEXT_REGEX.test(values.plan)
  ) {
    errors.plan = "Plan invalido.";
  }

  return errors;
};

const simulateUpdateRequest = async (
  previousPatient: Patient,
  payload: Patient
): Promise<Patient> => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  // Defensa en profundidad: aunque el frontend bloquea el campo, se valida igual.
  if (payload.dni !== previousPatient.dni) {
    throw new Error("No se puede modificar el DNI.");
  }

  return payload;
};

export default function PatientEditForm({ patient, onPatientSaved }: PatientEditFormProps) {
  const [formValues, setFormValues] = useState<PatientFormValues>({
    ...EMPTY_FORM_VALUES,
    dni: patient.dni
  });
  const [errors, setErrors] = useState<PatientFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingPatient, setPendingPatient] = useState<Patient | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setFormValues((previous) => ({
      ...previous,
      dni: patient.dni
    }));
  }, [patient.dni]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const canSubmit = useMemo(() => !isSaving && !isConfirmOpen, [isSaving, isConfirmOpen]);

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = event.target;
    let { value } = event.target;

    if (name === "telefono") {
      value = formatPhone(value);
    } else if (name === "nombre" || name === "apellido") {
      value = sanitizeNameLike(value, 50);
    } else if (name === "nacionalidad" || name === "ciudad") {
      value = sanitizeNameLike(value, 60);
    } else if (name === "direccion") {
      value = sanitizeAddress(value);
    } else if (name === "email") {
      value = value.replace(/\s+/g, "").slice(0, 80);
    } else if (name === "obraSocial") {
      value = sanitizeGeneralText(value, 80);
    } else if (name === "numeroAfiliado") {
      value = sanitizeAffiliateNumber(value);
    } else if (name === "plan") {
      value = sanitizeGeneralText(value, 40);
    }

    setFormValues((previous) => ({
      ...previous,
      [name]: value
    }));

    if (errors[name as keyof EditablePatientFields]) {
      setErrors((previous) => ({
        ...previous,
        [name]: undefined
      }));
    }
  };

  const runSave = async (candidatePatient: Patient) => {
    setErrors({});
    setIsSaving(true);

    try {
      const savedPatient = await simulateUpdateRequest(patient, candidatePatient);
      onPatientSaved?.(savedPatient);
      showToast("success", "Paciente actualizado correctamente.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo guardar el paciente.";
      setErrors({ form: message });
      showToast("error", message);
    } finally {
      setIsSaving(false);
      setPendingPatient(null);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm(formValues);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast("error", "Revisa los campos marcados en rojo.");
      return;
    }

    const candidatePatient: Patient = {
      ...patient,
      ...formValues
    };

    setPendingPatient(candidatePatient);
    setIsConfirmOpen(true);
  };

  const handleCancelConfirm = () => {
    setIsConfirmOpen(false);
    setPendingPatient(null);
  };

  const handleAcceptConfirm = async () => {
    if (!pendingPatient) {
      setIsConfirmOpen(false);
      return;
    }

    setIsConfirmOpen(false);
    await runSave(pendingPatient);
  };

  return (
    <>
      {isSaving ? (
        <div className="saving-indicator" role="status" aria-live="polite">
          <span className="saving-spinner" aria-hidden="true" />
          <span>Guardando...</span>
        </div>
      ) : null}

      <form className="patient-edit-form" onSubmit={handleSubmit} noValidate>
        <h2 className="form-title">Editar paciente existente</h2>

        <section className="form-section">
          <h3 className="section-title">Datos personales</h3>
          <div className="section-grid">
            <PatientFormField
              id="nombre"
              name="nombre"
              label="Nombre"
              value={formValues.nombre}
              onChange={handleInputChange}
              placeholder="Ej: Ana"
              required
              error={errors.nombre}
            />

            <PatientFormField
              id="apellido"
              name="apellido"
              label="Apellido"
              value={formValues.apellido}
              onChange={handleInputChange}
              placeholder="Ej: Perez"
              required
              error={errors.apellido}
            />

            <PatientFormField
              id="fechaNacimiento"
              name="fechaNacimiento"
              label="Fecha de nacimiento"
              type="date"
              value={formValues.fechaNacimiento}
              onChange={handleInputChange}
              placeholder="AAAA-MM-DD"
              required
              error={errors.fechaNacimiento}
            />

            {/* Campo protegido en frontend para mantener consistencia con la HU. */}
            <PatientFormField
              id="dni"
              name="dni"
              label="DNI"
              value={formValues.dni}
              onChange={handleInputChange}
              placeholder="No editable"
              disabled
            />

            <PatientFormField
              id="nacionalidad"
              name="nacionalidad"
              label="Nacionalidad"
              value={formValues.nacionalidad}
              onChange={handleInputChange}
              placeholder="Ej: Argentina"
              required
              error={errors.nacionalidad}
            />

            <PatientFormField
              id="sexo"
              name="sexo"
              label="Sexo"
              value={formValues.sexo}
              onChange={handleInputChange}
              options={SEX_OPTIONS}
              placeholder="Selecciona una opcion"
              required
              error={errors.sexo}
            />
          </div>
        </section>

        <section className="form-section">
          <h3 className="section-title">Contacto</h3>
          <div className="section-grid">
            <PatientFormField
              id="telefono"
              name="telefono"
              label="Telefono"
              value={formValues.telefono}
              onChange={handleInputChange}
              required
              error={errors.telefono}
              placeholder="11-4567-8901"
            />

            <PatientFormField
              id="email"
              name="email"
              label="Email"
              type="email"
              value={formValues.email}
              onChange={handleInputChange}
              placeholder="ejemplo@correo.com"
              required
              error={errors.email}
            />

            <PatientFormField
              id="direccion"
              name="direccion"
              label="Direccion"
              value={formValues.direccion}
              onChange={handleInputChange}
              placeholder="Ej: Av. Siempre Viva 742"
              required
              error={errors.direccion}
            />

            <PatientFormField
              id="ciudad"
              name="ciudad"
              label="Ciudad"
              value={formValues.ciudad}
              onChange={handleInputChange}
              placeholder="Ej: Buenos Aires"
              error={errors.ciudad}
            />
          </div>
        </section>

        <section className="form-section">
          <h3 className="section-title">Cobertura medica</h3>
          <div className="section-grid">
            <PatientFormField
              id="obraSocial"
              name="obraSocial"
              label="Obra social"
              value={formValues.obraSocial}
              onChange={handleInputChange}
              placeholder="Ej: OSDE"
              required
              error={errors.obraSocial}
            />

            <PatientFormField
              id="numeroAfiliado"
              name="numeroAfiliado"
              label="Numero de afiliado"
              value={formValues.numeroAfiliado}
              onChange={handleInputChange}
              placeholder="Ej: A-123456"
              required
              error={errors.numeroAfiliado}
            />

            <PatientFormField
              id="plan"
              name="plan"
              label="Plan"
              value={formValues.plan}
              onChange={handleInputChange}
              placeholder="Ej: 210"
              required
              error={errors.plan}
            />
          </div>
        </section>

        {errors.form ? <p className="form-error-message">{errors.form}</p> : null}

        <div className="form-actions">
          <button className="save-button" type="submit" disabled={!canSubmit}>
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>

      {isConfirmOpen ? (
        <div className="confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="confirm-box">
            <h3 id="confirm-title" className="confirm-title">
              Confirmar cambios
            </h3>
            <p className="confirm-text">Estas seguro de guardar los cambios del paciente?</p>
            <div className="confirm-actions">
              <button type="button" className="confirm-cancel-button" onClick={handleCancelConfirm}>
                Cancelar
              </button>
              <button type="button" className="confirm-accept-button" onClick={handleAcceptConfirm}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toast ? <div className={`toast toast-${toast.type}`}>{toast.message}</div> : null}
      </div>
    </>
  );
}
