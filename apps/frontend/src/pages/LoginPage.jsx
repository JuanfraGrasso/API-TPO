import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, CircularProgress, Paper, Stack, TextField, Typography } from "@mui/material";
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
    <Paper component="section" className="card auth-card" elevation={0} variant="outlined">
      <Box className="auth-card-copy">
        <Typography variant="overline" color="primary.main" fontWeight={700}>Acceso interno</Typography>
        <Typography component="h1" variant="h4" fontWeight={800}>Login Administrador</Typography>
        <Typography color="text.secondary">Ingreso para gestionar publicaciones, categorías y consultas.</Typography>
      </Box>

      <Stack component="form" onSubmit={handleSubmit} spacing={2}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@hardpoint.com"
          autoComplete="email"
          required
        />
        <TextField
          label="Contraseña"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Tu contraseña de admin"
          autoComplete="current-password"
          required
        />

        {feedback ? (
          <Alert severity={feedbackType}>{feedback}</Alert>
        ) : null}

        <Button variant="contained" type="submit" disabled={loading} startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}>
          {loading ? "Ingresando..." : "Ingresar"}
        </Button>
      </Stack>
    </Paper>
  );
}
