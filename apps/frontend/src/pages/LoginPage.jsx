import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminSession,
  getStoredAdminSession,
  loginAdmin,
  storeAdminSession
} from "../services/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const response = await loginAdmin({ email, password });

      storeAdminSession(response.token, response.admin);
      setFeedbackType("success");
      setFeedback("Sesion iniciada correctamente.");
      navigate("/admin", { replace: true });
    } catch (error) {
      setFeedbackType("error");
      setFeedback(error.message || "No se pudo iniciar sesion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card auth-card">
      <div className="auth-card-copy">
        <span className="eyebrow">Acceso interno</span>
        <h2>Login Administrador</h2>
        <p>Ingreso para gestionar publicaciones, categorias y consultas.</p>
      </div>

      <form className="contact-form auth-form" onSubmit={handleSubmit}>
        <div className="form-grid">
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
        </div>

        {feedback ? (
          <p className={`form-feedback form-feedback-${feedbackType}`}>{feedback}</p>
        ) : null}

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </section>
  );
}
