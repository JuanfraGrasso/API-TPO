import { Link, Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import CatalogPage from "../pages/CatalogPage";
import ContactPage from "../pages/ContactPage";
import LoginPage from "../pages/LoginPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";

function Layout({ children }) {
  function handleLogoError(event) {
    const fallbackSources = [
      "https://duthinsevssucwsgmfuz.supabase.co/storage/v1/object/public/public-images/hardpoint-logo.png",
      "https://duthinsevssucwsgmfuz.supabase.co/storage/v1/object/public/public-images/hardpoint-logo.jpg",
      "/logo.png",
      "/logo.jpg"
    ];

    const current = event.currentTarget;
    const attempt = Number(current.dataset.attempt || 0);

    if (attempt < fallbackSources.length - 1) {
      const nextAttempt = attempt + 1;
      current.dataset.attempt = String(nextAttempt);
      current.src = fallbackSources[nextAttempt];
      return;
    }

    current.style.display = "none";
    const textFallback = document.querySelector(".brand-logo-fallback");

    if (textFallback) {
      textFallback.style.display = "inline";
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="topbar-left">
            <Link className="brand-logo-link" to="/" aria-label="HardPoint Store">
              <img
                className="brand-logo"
                src="https://duthinsevssucwsgmfuz.supabase.co/storage/v1/object/public/public-images/hardpoint-logo.png"
                alt="HardPoint Store"
                data-attempt="0"
                onError={handleLogoError}
              />
              <span className="brand-logo-fallback">HardPoint Store</span>
            </Link>

            <nav className="main-nav">
              <Link to="/">Inicio</Link>
              <Link to="/catalogo">Catalogo</Link>
              <Link to="/contacto">Contacto</Link>
            </nav>
          </div>

          <Link className="login-icon-btn" to="/admin/login" aria-label="Ingresar al panel admin">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M20 21a8 8 0 0 0-16 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <circle
                cx="12"
                cy="8"
                r="3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
          </Link>
        </div>
      </header>
      <main className="container">{children}</main>
      <footer className="site-footer">
        <div className="site-footer-inner">
          <p>HardPoint Store © 2026</p>
          <p>Hardware, perifericos y componentes para tu proxima build.</p>
        </div>
      </footer>
    </div>
  );
}

export default function AppRouter() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
