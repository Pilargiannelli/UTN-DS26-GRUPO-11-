import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginData } from "../schemas/userSchema";
import { useFetch } from "../hooks/useFetch";
import imosLogo from "../assets/img/IMOS_LOGO.png";
import { Form, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.ts";
import type { Usuario } from "../types/Usuario.ts";
import "../assets/styles/Login.css";
import { useToast } from "../hooks/useToast.ts";
import { ToastMensaje } from "../components/NotifyToast.tsx";

export default function Login() {
  const { showToast, setShowToast } = useToast("registroExitoso");
  const { data: users, loading: loadingUsers, error } = useFetch<Usuario[]>("/users.json");
  const [authError, setAuthError] = useState(false);
  const [success, setSuccess] = useState(false);
  const { setRol, setUsuario } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });
  const onSubmit = (data: LoginData) => {
    if (!users) return;
    const found = users.find( (x) => (x.u === data.username.trim() || x.docs.email === data.username.trim())&& x.p === data.password );
    if (found) { 
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setRol(found.rol);
        setUsuario(found);
        localStorage.setItem("rol", found.rol);
        localStorage.setItem("usuario", JSON.stringify(found));
        navigate(`/home`);
      }, 1500);
    } else {
      setAuthError(true);
    }
  };
  if (loadingUsers) return <Spinner />;
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
          {loadingUsers && <Spinner animation="border" />}
          {error && <p>Error al cargar usuarios</p>}
          <Form onSubmit={handleSubmit(onSubmit)}>
            {/* Usuario */}
            <Form.Group className="login-field mb-3" controlId="inp-user">
              <Form.Label className="login-label">Email / Nombre de usuario</Form.Label>
              <Form.Control className="login-input" type="text" placeholder="email / nombre usuario" autoComplete="username" {...register("username")} isInvalid={!!errors.username || authError} />
              <Form.Control.Feedback type="invalid"> {errors.username?.message} </Form.Control.Feedback>
            </Form.Group>
            {/* Contraseña */}
            <Form.Group className="login-field mb-3" controlId="inp-pass">
              <Form.Label className="login-label">Contraseña</Form.Label>
              <Form.Control className="login-input" type="password" placeholder="contraseña" autoComplete="current-password" {...register("password")} isInvalid={!!errors.password || authError} />
              <Form.Control.Feedback type="invalid"> {errors.password?.message} </Form.Control.Feedback>
            </Form.Group>
            <Button  className="login-button w-100" variant={success ? "success" : "primary"} type="submit" disabled={loadingUsers || success} >
              {success ? "Autenticado" : "LOGIN"}
            </Button>
            {authError && (
              <div className="login-error-zone mt-3">
                <div className="login-error-message" role="alert" aria-live="assertive">
                  USUARIO O CONTRASEÑA INVALIDOS
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
