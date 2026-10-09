import AppRouter from "./routes/AppRouter";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <AppRouter />
    </ThemeProvider>
  );
}
