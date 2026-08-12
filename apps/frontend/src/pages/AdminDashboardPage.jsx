import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearAdminSession,
  getAdminInquiries,
  getAdminSession,
  getStoredAdminProfile,
  getStoredAdminSession
} from "../services/api";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(getStoredAdminProfile());
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getStoredAdminSession();

    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }

    let active = true;

    async function loadDashboard() {
      try {
        const session = await getAdminSession(token);

        if (!active) {
          return;
        }

        setAdmin(session.admin);
        const inquiryResponse = await getAdminInquiries(token);

        if (!active) {
          return;
        }

        setInquiries(inquiryResponse.data || []);
      } catch (requestError) {
        if (!active) {
          return;
        }

        clearAdminSession();
        navigate("/admin/login", { replace: true });
        setError(requestError.message || "No se pudo cargar el panel.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [navigate]);

  function handleLogout() {
    clearAdminSession();
    navigate("/admin/login", { replace: true });
  }

  return (
    <section className="card auth-card admin-dashboard">
      <div className="admin-dashboard-header">
        <div>
          <span className="eyebrow">Panel interno</span>
          <h2>Panel Administrador</h2>
          <p>
            {admin ? `Sesión activa de ${admin.firstName} ${admin.lastName}` : "Dashboard inicial para administracion del comercio."}
          </p>
        </div>

        <button className="btn btn-ghost" type="button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      {loading ? <p>Cargando panel...</p> : null}
      {error ? <p className="form-feedback form-feedback-error">{error}</p> : null}

      {!loading ? (
        <div className="admin-dashboard-grid">
          <article className="card admin-metric-card">
            <span>Consultas</span>
            <strong>{inquiries.length}</strong>
          </article>

          <article className="card admin-list-card">
            <h3>Ultimas consultas</h3>
            {inquiries.length === 0 ? <p>No hay consultas registradas.</p> : null}

            <div className="admin-inquiries-list">
              {inquiries.map((inquiry) => (
                <article key={inquiry.id} className="admin-inquiry-item">
                  <div>
                    <strong>{inquiry.full_name}</strong>
                    <p>{inquiry.email}</p>
                  </div>
                  <p>{inquiry.subject}</p>
                  <small>{inquiry.status}</small>
                </article>
              ))}
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
