import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginData } from "../schemas/loginSchema";
import { apiFetch } from "../services/api";
import imosLogo from "../assets/img/IMOS_LOGO.png";
import { Form, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { SesionLogin } from "../types/UsuarioSesion";
import "../assets/styles/Login.css";
import { useToast } from "../hooks/useToast";
import { ToastMensaje } from "../components/NotifyToast";

export default function Login() {
  const { showToast, setShowToast } = useToast("registroExitoso");
  const [authError, setAuthError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (datos: LoginData) => {
    setAuthError(null);
    setEnviando(true);

    try {
      const sesion = await apiFetch<SesionLogin>("/auth/login", {
        method: "POST",
        body: JSON.stringify(datos),
      });

      login(sesion);

      setSuccess(true);

      setTimeout(() => {
        navigate("/home");
      }, 1500);
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "Email o contraseña incorrectos"
      );
      setEnviando(false);
    }
  };

  return (
    <div className="login-page">
      <ToastMensaje
        mensaje="Cuenta creada correctamente"
        tipo="toast-good"
        mostrar={showToast}
        onClose={() => setShowToast(false)}
      />

      <div className="login-card">
        <section className="login-brand">
          <img
            className="login-logo-img"
            src={imosLogo}
            alt="IMOS"
          />
        </section>

        <section className="login-form-panel">
          <h1 className="login-title">Login</h1>

          <p className="login-subtitle">
            Ingresá tus credenciales para continuar
          </p>

          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group
              className="login-field mb-3"
              controlId="inp-email"
            >
              <Form.Label className="login-label">
                Email
              </Form.Label>

              <Form.Control
                className="login-input"
                type="email"
                placeholder="email"
                autoComplete="email"
                {...register("email")}
                isInvalid={!!errors.email || !!authError}
              />

              <Form.Control.Feedback type="invalid">
                {errors.email?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group
              className="login-field mb-3"
              controlId="inp-pass"
            >
              <Form.Label className="login-label">
                Contraseña
              </Form.Label>

              <Form.Control
                className="login-input"
                type="password"
                placeholder="contraseña"
                autoComplete="current-password"
                {...register("password")}
                isInvalid={!!errors.password || !!authError}
              />

              <Form.Control.Feedback type="invalid">
                {errors.password?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Button
              className="login-button w-100"
              variant={success ? "success" : "primary"}
              type="submit"
              disabled={enviando || success}
            >
              {success ? (
                "Autenticado"
              ) : enviando ? (
                <Spinner size="sm" animation="border" />
              ) : (
                "LOGIN"
              )}
            </Button>

            {authError && (
              <div className="login-error-zone mt-3">
                <div
                  className="login-error-message"
                  role="alert"
                  aria-live="assertive"
                >
                  {authError}
                </div>

                <span className="login-forgot">
                  olvidaste tu contraseña
                </span>
              </div>
            )}
          </Form>
        </section>
      </div>
    </div>
  );
}