import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginData } from "../schemas/loginSchema";
import { apiFetch } from "../services/api";
import { guardarToken } from "../services/sesion";
import imosLogo from "../assets/img/IMOS_LOGO.png";
import { Form, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.ts";
import type { Sesion } from "../types/AuthUsuario.ts";
import "../assets/styles/Login.css";
import { useToast } from "../hooks/useToast.ts";
import { ToastMensaje } from "../components/NotifyToast.tsx";

export default function Login() {
  const { showToast, setShowToast } = useToast("registroExitoso");
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { setRol, setUsuario } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (datos: LoginData) => {
    setAuthError(null);
    setLoading(true);
    try {
      const sesion = await apiFetch<Sesion>("/auth/login", {
        method: "POST",
        body: JSON.stringify(datos),
      });
      guardarToken(sesion.token);
      setUsuario(sesion.usuario);
      setRol(sesion.usuario.rol);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate("/home");
      }, 1500);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Email o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <ToastMensaje mensaje="Cuenta creada correctamente" tipo="toast-good" mostrar={showToast} onClose={() => setShowToast(false)} />
      <div className="login-card">
        <section className="login-brand">
          <img className="login-logo-img" src={imosLogo} alt="IMOS" />
        </section>
        <section className="login-form-panel">
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">Ingresá tus credenciales para continuar</p>
          <Form onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <Form.Group className="login-field mb-3" controlId="inp-user">
              <Form.Label className="login-label">Email</Form.Label>
              <Form.Control className="login-input" type="email" placeholder="email" autoComplete="username" {...register("email")} isInvalid={!!errors.email || !!authError} />
              <Form.Control.Feedback type="invalid"> {errors.email?.message} </Form.Control.Feedback>
            </Form.Group>
            {/* Contraseña */}
            <Form.Group className="login-field mb-3" controlId="inp-pass">
              <Form.Label className="login-label">Contraseña</Form.Label>
              <Form.Control className="login-input" type="password" placeholder="contraseña" autoComplete="current-password" {...register("password")} isInvalid={!!errors.password || !!authError} />
              <Form.Control.Feedback type="invalid"> {errors.password?.message} </Form.Control.Feedback>
            </Form.Group>
            <Button className="login-button w-100" variant={success ? "success" : "primary"} type="submit" disabled={loading || success} >
              {loading ? <Spinner animation="border" size="sm" /> : success ? "Autenticado" : "LOGIN"}
            </Button>
            {authError && (
              <div className="login-error-zone mt-3">
                <div className="login-error-message" role="alert" aria-live="assertive">
                  {authError}
                </div>
                <span className="login-forgot">olvidaste tu contraseña</span>
              </div>
            )}
          </Form>
        </section>
      </div>
    </div>
  );
}
