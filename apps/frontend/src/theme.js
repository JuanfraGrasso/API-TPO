import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536
    }
  },
  palette: {
    primary: { main: "#c94722" },
    secondary: { main: "#ff6a3d" },
    error: { main: "#dc2626" },
    background: { default: "#f3f3f1", paper: "#ffffff" },
    text: { primary: "#111218", secondary: "#4f535f" }
  },
  typography: {
    fontFamily: '"Manrope", "Inter", sans-serif',
    button: { fontSize: "0.96rem", fontWeight: 700, textTransform: "none" },
    h1: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 800 },
    h2: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 800 },
    h3: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 800 },
    h4: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 800 },
    h5: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 750 },
    h6: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 750 }
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { minHeight: 40, borderRadius: 7, boxShadow: "none", fontSize: "0.96rem" }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: { borderColor: "rgba(20, 22, 28, 0.14)" }
      }
    },
    MuiTextField: {
      defaultProps: { fullWidth: true, size: "small" }
    },
    MuiTab: {
      styleOverrides: {
        root: { minHeight: 48, textTransform: "none", fontWeight: 700, fontSize: "0.95rem" }
      }
    }
  }
});

export default theme;
