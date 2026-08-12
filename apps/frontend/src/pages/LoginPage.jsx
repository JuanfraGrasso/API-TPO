import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminSession,
  getStoredAdminSession,
  loginAdmin,
  registerAdmin,
  storeAdminSession
} from "../services/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("info");

  useEffect(() => {
    const token = getStoredAdminSession();

    if (!token) {
      return;
    }

    getAdminSession(token)
      .then(() => {
        navigate("/admin", { replace: true });
      })
      .catch(() => {
        localStorage.removeItem("hardpoint-admin-session");
        localStorage.removeItem("hardpoint-admin-session-admin");
      });
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setFeedback("");

    try {
      const response =
        mode === "login"
          ? await loginAdmin({ email, password })
          : await registerAdmin({
              firstName,
              lastName,
              email,
              phone,
              password,
              inviteCode
            });

      storeAdminSession(response.token, response.admin);
      setFeedbackType("success");
      setFeedback(mode === "login" ? "Sesion iniciada correctamente." : "Administrador registrado correctamente.");
      navigate("/admin", { replace: true });
    } catch (error) {
      setFeedbackType("error");
      setFeedback(error.message || (mode === "login" ? "No se pudo iniciar sesion." : "No se pudo registrar el administrador."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card auth-card">
      <div className="auth-card-copy">
        <span className="eyebrow">Acceso interno</span>
        <h2>{mode === "login" ? "Login Administrador" : "Registro de Administrador"}</h2>
        <p>
          {mode === "login"
            ? "Ingreso para gestionar publicaciones, categorias y consultas."
            : "Alta restringida para crear nuevos administradores con un codigo de invitacion."}
        </p>
      </div>

      <form className="contact-form auth-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          {mode === "register" ? (
            <>
              <label className="form-field">
                <span>Nombre</span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="Juan"
                  autoComplete="given-name"
                  required
                />
              </label>

              <label className="form-field">
                <span>Apellido</span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Pérez"
                  autoComplete="family-name"
                  required
                />
              </label>
            </>
          ) : null}

          <label className="form-field form-field-full">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@hardpoint.com"
              autoComplete="email"
              required
            />
          </label>

          {mode === "register" ? (
            <label className="form-field form-field-full">
              <span>Telefono</span>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+54 11 5555-0000"
                autoComplete="tel"
              />
            </label>
          ) : null}

          <label className="form-field form-field-full">
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tu contraseña de admin"
              autoComplete="current-password"
              required
            />
          </label>

          {mode === "register" ? (
            <label className="form-field form-field-full">
              <span>Codigo de invitacion</span>
              <input
                type="password"
                value={inviteCode}
                onChange={(event) => setInviteCode(event.target.value)}
                placeholder="Clave de alta interna"
                autoComplete="one-time-code"
                required
              />
            </label>
          ) : null}
        </div>

        {feedback ? (
          <p className={`form-feedback form-feedback-${feedbackType}`}>{feedback}</p>
        ) : null}

        <div className="auth-actions">
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading
              ? mode === "login"
                ? "Ingresando..."
                : "Registrando..."
              : mode === "login"
                ? "Ingresar"
                : "Registrarme"}
          </button>

          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => {
              setFeedback("");
              setMode((currentMode) => (currentMode === "login" ? "register" : "login"));
            }}
          >
            {mode === "login" ? "Quiero registrarme" : "Ya tengo una cuenta"}
          </button>
        </div>
      </form>
    </section>
  );
}
