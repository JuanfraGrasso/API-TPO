import { Box, Button, Card, CardContent, CardMedia, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const tickerCopies = [0, 1, 2, 3];

export default function HomePage() {
  return (
    <Box component="section" className="home-page">
      <Card component="section" className="hero-banner" elevation={0} sx={{ display: "block" }}>
        <CardMedia
          component="img"
          className="hero-banner-image"
          image="https://duthinsevssucwsgmfuz.supabase.co/storage/v1/object/public/public-images/background.jpg"
          alt="Notebook gamer sobre escritorio oscuro"
        />
        <Box className="hero-banner-overlay" />
        <Box className="hero-banner-content">
          <Typography
            component="h2"
            variant="h2"
            sx={{ fontSize: { xs: "2.2rem", sm: "3rem", lg: "3.75rem" }, maxWidth: { xs: "14ch", md: "18ch" } }}
          >
            Equipos listos
            <Box component="span" className="hero-title-accent"> para rendir de verdad</Box>
          </Typography>
          <Typography component="p">
            HardPoint combina componentes premium, asesoramiento tecnico y stock
            actualizado para que armes o mejores tu equipo sin complicaciones.
          </Typography>

          <Stack className="hero-banner-actions" direction={{ xs: "column", sm: "row" }}>
            <Button component={Link} to="/catalogo" variant="contained" color="primary">
              Ver catalogo
            </Button>
            <Button
              component={Link}
              to="/contacto"
              variant="outlined"
              sx={{ color: "#fff", borderColor: "rgba(255,255,255,.8)", bgcolor: "rgba(22,22,22,.42)" }}
            >
              Pedir asesoria
            </Button>
          </Stack>
        </Box>
      </Card>

      <Box component="section" className="sliding-strip" aria-label="Novedades HardPoint">
        <Box className="sliding-strip-track">
          {tickerCopies.map((copy) => (
            <Typography component="p" className="sliding-strip-text" aria-hidden={copy > 0} key={copy}>
              HARDPOINT <span className="sliding-strip-accent">NEXT GEN</span> 2026
              <Box component="span" className="sliding-strip-chip">
                [ CPU <Box component="img" className="sliding-strip-icon" src="https://duthinsevssucwsgmfuz.supabase.co/storage/v1/object/public/public-images/cpu-logo.jpg" alt={copy === 0 ? "CPU" : ""} aria-hidden={copy > 0} /> ]
              </Box>
              <Box component="span" className="sliding-strip-chip">
                [ RAM <Box component="img" className="sliding-strip-icon" src="https://duthinsevssucwsgmfuz.supabase.co/storage/v1/object/public/public-images/ram-logo.jpg" alt={copy === 0 ? "RAM" : ""} aria-hidden={copy > 0} /> ]
              </Box>
              <Box component="span" className="sliding-strip-chip">
                [ GPU <Box component="img" className="sliding-strip-icon" src="https://duthinsevssucwsgmfuz.supabase.co/storage/v1/object/public/public-images/gpu-logo.jpg" alt={copy === 0 ? "GPU" : ""} aria-hidden={copy > 0} /> ]
              </Box>
              <span className="sliding-strip-accent"> TODO PARA TU BUILD</span>
            </Typography>
          ))}
        </Box>
      </Box>

      <Stack component="section" className="home-cards-stack">
        <Card
          component="article"
          className="showcase-card showcase-card-orange"
          elevation={0}
        >
          <CardMedia
            component="img"
            className="showcase-image"
            image="https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?auto=format&fit=crop&w=1200&q=80"
            alt="Placa de video de alto rendimiento"
          />
          <CardContent className="showcase-content" sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Box component="span" className="card-label">Gaming</Box>
            <Typography component="h3" variant="h4">Configura hoy. Mejora cuando quieras.</Typography>
            <Typography component="p">
              GPUs, memorias y almacenamiento seleccionados para dar el salto de
              rendimiento sin rehacer toda tu PC.
            </Typography>
            <Button component={Link} to="/catalogo" variant="contained" sx={{ alignSelf: "flex-start", bgcolor: "#12141a", color: "#fff", "&:hover": { bgcolor: "#000", color: "#ff8560" } }}>
              Ver componentes
            </Button>
          </CardContent>
        </Card>

        <Card
          component="article"
          className="showcase-card showcase-card-white showcase-card-reverse"
          elevation={0}
        >
          <CardMedia
            component="img"
            className="showcase-image"
            image="https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80"
            alt="Mesa de trabajo con componentes de computadora"
          />
          <CardContent className="showcase-content" sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Box component="span" className="card-label">Productividad</Box>
            <Typography component="h3" variant="h4">Armados balanceados para estudio y trabajo</Typography>
            <Typography component="p">
              Te ayudamos a definir una build estable para jornadas largas,
              multitarea y crecimiento futuro de tu setup.
            </Typography>
            <Button component={Link} to="/contacto" variant="contained" sx={{ alignSelf: "flex-start" }}>
              Pedir recomendacion
            </Button>
          </CardContent>
        </Card>

        <Card
          component="article"
          className="showcase-card showcase-card-gray"
          elevation={0}
        >
          <CardMedia
            component="img"
            className="showcase-image"
            image="https://images.unsplash.com/photo-1587202372616-b43abea06c2a?auto=format&fit=crop&w=1200&q=80"
            alt="Teclado mecanico y mouse sobre escritorio"
          />
          <CardContent className="showcase-content" sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Box component="span" className="card-label">Perifericos</Box>
            <Typography component="h3" variant="h4">Un setup completo en una sola tienda</Typography>
            <Typography component="p">
              Monitores, teclados y mouse para cerrar una experiencia comoda,
              consistente y lista para usar desde el primer dia.
            </Typography>
            <Button component={Link} to="/catalogo" variant="contained" sx={{ alignSelf: "flex-start", bgcolor: "#df4a1c", color: "#fff", "&:hover": { bgcolor: "#c94722" } }}>
              Explorar catalogo
            </Button>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
