import { Link, Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import CatalogPage from "../pages/CatalogPage";
import ContactPage from "../pages/ContactPage";
import LoginPage from "../pages/LoginPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";

function Layout({ children }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand-block">
            <span className="brand-kicker">Hardware Premium Store</span>
            <h1>HardPoint Computacion</h1>
          </div>

          <nav className="main-nav">
          <Link to="/">Inicio</Link>
          <Link to="/catalogo">Catalogo</Link>
          <Link to="/contacto">Contacto</Link>
          <Link to="/admin/login">Admin</Link>
          </nav>
        </div>
      </header>
      <main className="container">{children}</main>
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
