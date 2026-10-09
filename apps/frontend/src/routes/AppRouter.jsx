import { useEffect, useState } from "react";
import { Link as RouterLink, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AppBar, Box, Button, Container, Divider, IconButton, Link, Menu, MenuItem, Stack, Toolbar, Typography } from "@mui/material";
import { Menu as MenuIcon, UserRound } from "lucide-react";
import HomePage from "../pages/HomePage";
import CatalogPage from "../pages/CatalogPage";
import ContactPage from "../pages/ContactPage";
import LoginPage from "../pages/LoginPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import { clearAdminSession, getStoredAdminSession } from "../services/api";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getStoredAdminSession()));
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuKind, setMenuKind] = useState(null);

  useEffect(() => {
    setIsLoggedIn(Boolean(getStoredAdminSession()));
    setMenuAnchor(null);
    setMenuKind(null);
  }, [location.pathname]);

  function openMenu(event, kind) {
    setMenuAnchor(event.currentTarget);
    setMenuKind(kind);
  }

  function closeMenu() {
    setMenuAnchor(null);
    setMenuKind(null);
  }

  function handleLogout() {
    clearAdminSession();
    setIsLoggedIn(false);
    closeMenu();
    navigate("/admin/login", { replace: true });
  }

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

  const navLinks = [
    { label: "Inicio", to: "/" },
    { label: "Catálogo", to: "/catalogo" },
    { label: "Contacto", to: "/contacto" }
  ];

  return (
    <Box className="app-shell">
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: "divider", zIndex: 10 }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, sm: 72 }, gap: 2 }}>
            <Box component={RouterLink} to="/" aria-label="HardPoint Store" className="brand-logo-link" sx={{ flexShrink: 0 }}>
              <Box
                component="img"
                className="brand-logo"
                src="https://duthinsevssucwsgmfuz.supabase.co/storage/v1/object/public/public-images/hardpoint-logo.png"
                alt="HardPoint Store"
                data-attempt="0"
                onError={handleLogoError}
              />
              <Typography component="span" className="brand-logo-fallback">HardPoint Store</Typography>
            </Box>

            <Stack component="nav" direction="row" spacing={0.5} sx={{ display: { xs: "none", md: "flex" }, flexGrow: 1 }}>
              {navLinks.map((item) => (
                <Button key={item.to} component={RouterLink} to={item.to} color="inherit">
                  {item.label}
                </Button>
              ))}
            </Stack>

            <Box sx={{ flexGrow: 1, display: { xs: "block", md: "none" } }} />

            <IconButton
              aria-label="Abrir navegación"
              aria-haspopup="true"
              onClick={(event) => openMenu(event, "navigation")}
              sx={{ display: { xs: "inline-flex", md: "none" } }}
            >
              <MenuIcon size={21} />
            </IconButton>

            <IconButton
              component={!isLoggedIn ? RouterLink : "button"}
              to={!isLoggedIn ? "/admin/login" : undefined}
              aria-label={isLoggedIn ? "Cuenta de administrador" : "Ingresar al panel admin"}
              aria-haspopup={isLoggedIn ? "true" : undefined}
              onClick={isLoggedIn ? (event) => openMenu(event, "account") : undefined}
              sx={{ border: 1, borderColor: "divider", width: 38, height: 38, color: "text.primary" }}
            >
              <UserRound size={18} />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        {menuKind === "navigation" ? navLinks.map((item) => (
          <MenuItem key={item.to} component={RouterLink} to={item.to} onClick={closeMenu}>
            {item.label}
          </MenuItem>
        )) : null}
        {menuKind === "account" ? (
          <>
            <MenuItem component={RouterLink} to="/admin" onClick={closeMenu}>Panel administrador</MenuItem>
            <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
          </>
        ) : null}
      </Menu>

      <Box component="main" className="container">{children}</Box>

      <Box component="footer" className="site-footer">
        <Container maxWidth="xl" className="site-footer-container">
          <Box className="site-footer-grid" sx={{ gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "1.5fr 1fr 1fr" } }}>
            <Box className="footer-col footer-col-brand">
              <Box className="footer-brand">
                <Box
                  component="img"
                  className="brand-logo footer-logo"
                  src="https://duthinsevssucwsgmfuz.supabase.co/storage/v1/object/public/public-images/hardpoint-logo.png"
                  alt="HardPoint Store"
                  onError={handleLogoError}
                />
                <Typography component="span" className="brand-logo-fallback footer-brand-fallback">HardPoint Store</Typography>
              </Box>
              <Typography className="footer-description">
                Especialistas en hardware gamer, componentes de alto rendimiento y armado de computadoras a medida con garantía oficial.
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" className="footer-badges">
                <Typography component="span" className="footer-badge">Garantía Oficial</Typography>
                <Typography component="span" className="footer-badge">Envíos a todo el país</Typography>
              </Stack>
            </Box>

            <Box className="footer-col">
              <Typography component="h2" className="footer-col-title">Navegación</Typography>
              <Stack component="nav" className="footer-links" sx={{ "& .MuiLink-root": { color: "#a6adbf", textDecoration: "none", fontSize: "0.92rem", "&:hover": { color: "primary.main" } } }}>
                <Link component={RouterLink} to="/">Inicio</Link>
                <Link component={RouterLink} to="/catalogo">Catálogo de Productos</Link>
                <Link component={RouterLink} to="/contacto">Contacto y Asesoría</Link>
                <Link component={RouterLink} to="/admin/login">Acceso Administrador</Link>
              </Stack>
            </Box>

            <Box className="footer-col">
              <Typography component="h2" className="footer-col-title">Categorías</Typography>
              <Stack component="nav" className="footer-links" sx={{ "& .MuiLink-root": { color: "#a6adbf", textDecoration: "none", fontSize: "0.92rem", "&:hover": { color: "primary.main" } } }}>
                <Link component={RouterLink} to="/catalogo">Placas de Video</Link>
                <Link component={RouterLink} to="/catalogo">Procesadores</Link>
                <Link component={RouterLink} to="/catalogo">Memorias RAM</Link>
                <Link component={RouterLink} to="/catalogo">Almacenamiento SSD</Link>
                <Link component={RouterLink} to="/catalogo">Periféricos & Gabinetes</Link>
              </Stack>
            </Box>
          </Box>
          <Stack className="site-footer-bottom" direction={{ xs: "column", sm: "row" }}>
            <Typography>HardPoint Store © 2026. Todos los derechos reservados.</Typography>
            <Typography className="footer-legal">Componentes, periféricos y tecnología de vanguardia.</Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
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
