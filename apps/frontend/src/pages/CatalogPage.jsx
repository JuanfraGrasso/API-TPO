import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  InputAdornment,
  IconButton,
  MenuItem,
  Paper,
  Slider,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { getPublications } from "../services/api";

export default function CatalogPage() {
  const [publications, setPublications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [activeBrand, setActiveBrand] = useState("Todas");
  const [activeAvailability, setActiveAvailability] = useState("Todos");
  const [sortBy, setSortBy] = useState("featured");
  const [maxPriceFilter, setMaxPriceFilter] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [openFilterSections, setOpenFilterSections] = useState({
    categories: true,
    brands: false,
    availability: false,
    price: false,
    sort: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImageIndexByPublication, setActiveImageIndexByPublication] = useState({});

  useEffect(() => {
    let isMounted = true;

    async function loadPublications() {
      try {
        setIsLoading(true);
        const result = await getPublications();
        if (isMounted) {
          setPublications(result.data || []);
          setError("");
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError.message || "Ocurrio un error al cargar el catalogo");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPublications();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = [
    "Todas",
    ...new Set(publications.map((publication) => publication.categories?.name).filter(Boolean))
  ];

  const brands = [
    "Todas",
    ...new Set(publications.map((publication) => publication.brand).filter(Boolean))
  ];

  const availabilityOptions = [
    "Todos",
    ...new Set(publications.map((publication) => publication.availability_status).filter(Boolean))
  ];

  const priceValues = publications
    .map((publication) => publication.price)
    .filter((price) => typeof price === "number" && Number.isFinite(price));

  const minPrice = priceValues.length ? Math.min(...priceValues) : 0;
  const maxPrice = priceValues.length ? Math.max(...priceValues) : 0;

  useEffect(() => {
    if (maxPriceFilter == null && maxPrice > 0) {
      setMaxPriceFilter(maxPrice);
    }
  }, [maxPriceFilter, maxPrice]);

  function formatAvailabilityLabel(value) {
    if (value === "sin_stock") {
      return "Sin stock";
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function formatPrice(value) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }).format(value);
  }

  function toggleFilterSection(section) {
    setOpenFilterSections((current) => ({
      ...current,
      [section]: !current[section]
    }));
  }

  function goToPreviousImage(publicationId, totalImages) {
    setActiveImageIndexByPublication((prev) => {
      const current = prev[publicationId] || 0;
      const next = (current - 1 + totalImages) % totalImages;
      return { ...prev, [publicationId]: next };
    });
  }

  function goToNextImage(publicationId, totalImages) {
    setActiveImageIndexByPublication((prev) => {
      const current = prev[publicationId] || 0;
      const next = (current + 1) % totalImages;
      return { ...prev, [publicationId]: next };
    });
  }

  function goToImage(publicationId, index) {
    setActiveImageIndexByPublication((prev) => ({ ...prev, [publicationId]: index }));
  }

  function FilterSectionHeader({ section, children }) {
    const isOpen = openFilterSections[section];

    return (
      <Button
        type="button"
        className="catalog-filter-heading"
        variant="text"
        fullWidth
        aria-expanded={isOpen}
        onClick={() => toggleFilterSection(section)}
        endIcon={<ChevronDown className={`catalog-filter-chevron ${isOpen ? "open" : ""}`} size={18} aria-hidden="true" />}
        sx={{ justifyContent: "space-between", textAlign: "left", minHeight: 34, py: 0.25 }}
      >
        {children}
      </Button>
    );
  }

  const categoryCounts = publications.reduce(
    (acc, publication) => {
      const key = publication.categories?.name || "Sin categoria";
      acc[key] = (acc[key] || 0) + 1;
      acc.Todas += 1;
      return acc;
    },
    { Todas: 0 }
  );

  const brandCounts = publications.reduce(
    (acc, publication) => {
      const key = publication.brand || "Sin marca";
      acc[key] = (acc[key] || 0) + 1;
      acc.Todas += 1;
      return acc;
    },
    { Todas: 0 }
  );

  const availabilityCounts = publications.reduce(
    (acc, publication) => {
      const key = publication.availability_status || "sin_stock";
      acc[key] = (acc[key] || 0) + 1;
      acc.Todos += 1;
      return acc;
    },
    { Todos: 0 }
  );

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredPublications = publications.filter((publication) => {
    const matchesCategory = activeCategory === "Todas"
      || publication.categories?.name === activeCategory;
    const matchesBrand = activeBrand === "Todas"
      || publication.brand === activeBrand;
    const matchesAvailability = activeAvailability === "Todos"
      || publication.availability_status === activeAvailability;

    const searchableText = `${publication.name} ${publication.brand || ""} ${publication.sku || ""}`
      .toLowerCase();
    const matchesSearch = searchableText.includes(normalizedSearch);

    const hasPrice = typeof publication.price === "number" && Number.isFinite(publication.price);
    const sliderLimit = maxPriceFilter ?? maxPrice;
    const matchesPrice = !hasPrice || publication.price <= sliderLimit;

    return matchesCategory && matchesBrand && matchesAvailability && matchesSearch && matchesPrice;
  });

  const visiblePublications = [...filteredPublications].sort((a, b) => {
    if (sortBy === "price-asc") {
      const left = typeof a.price === "number" ? a.price : Number.MAX_SAFE_INTEGER;
      const right = typeof b.price === "number" ? b.price : Number.MAX_SAFE_INTEGER;
      return left - right;
    }

    if (sortBy === "price-desc") {
      const left = typeof a.price === "number" ? a.price : Number.MIN_SAFE_INTEGER;
      const right = typeof b.price === "number" ? b.price : Number.MIN_SAFE_INTEGER;
      return right - left;
    }

    if (sortBy === "name-asc") {
      return a.name.localeCompare(b.name, "es");
    }

    if (sortBy === "newest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }

    return 0;
  });

  return (
    <Box component="section" className="catalog-page catalog-page-wide">
      <Box className="catalog-layout">
        <Paper component="aside" elevation={0} className={`card catalog-sidebar ${isMobileFilterOpen ? "is-open" : "is-closed"}`}>
          <Paper
            className="catalog-sidebar-head"
            elevation={0}
            sx={{
              bgcolor: "primary.main",
              color: "background.paper",
              p: 1.25,
              width: "calc(100% + 2.6rem)",
              ml: "-1.3rem",
              mr: "-1.3rem",
              mt: "-1.3rem",
              mb: 0.25,
              borderRadius: "8px 8px 0 0"
            }}
          >
            <Typography component="h1" variant="h5" className="catalog-title" color="inherit" fontWeight={800}>
              Catálogo
            </Typography>
            <Button
              type="button"
              className="catalog-mobile-toggle-btn"
              variant="outlined"
              size="small"
              onClick={() => setIsMobileFilterOpen((prev) => !prev)}
              aria-expanded={isMobileFilterOpen}
              aria-label={isMobileFilterOpen ? "Ocultar filtros" : "Mostrar filtros"}
              endIcon={<ChevronDown className={`catalog-toggle-icon ${isMobileFilterOpen ? "open" : ""}`} size={18} />}
              sx={{
                display: "none",
                whiteSpace: "nowrap",
                color: "#111218",
                borderColor: "rgba(17,18,24,.45)",
                "@media (max-width: 600px)": { display: "inline-flex" }
              }}
            >
              <span>{isMobileFilterOpen ? "Ocultar filtros" : "Filtros y Búsqueda"}</span>
            </Button>
          </Paper>

          <Stack className="catalog-sidebar-body" spacing={0.5}>
            <div className="catalog-search-group">
              <TextField
                id="catalog-search"
                label="Buscar publicaciones"
                type="search"
                placeholder="Ej: RTX 4060, Kingston, SSD..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment> }}
              />
            </div>

            <div className="catalog-filter-group">
              <FilterSectionHeader section="categories">Categorias</FilterSectionHeader>
              {openFilterSections.categories ? (
                <Stack spacing={0.5}>
                  {categories.map((category) => {
                    const selected = category === activeCategory;
                    return (
                      <Button
                        key={category}
                        variant={selected ? "contained" : "text"}
                        color={selected ? "primary" : "inherit"}
                        size="small"
                        fullWidth
                        onClick={() => setActiveCategory(category)}
                        sx={{
                          justifyContent: "space-between",
                          textAlign: "left",
                          color: selected ? "#fff" : "text.primary",
                          backgroundColor: selected ? "primary.main" : "transparent",
                          "&:hover": { backgroundColor: selected ? "primary.dark" : "action.hover" }
                        }}
                      >
                        <Box component="span">{category}</Box>
                        <Typography component="span" variant="body2" fontWeight={700} color="inherit">
                          {categoryCounts[category] || 0}
                        </Typography>
                      </Button>
                    );
                  })}
                </Stack>
              ) : null}
            </div>

            <div className="catalog-filter-group">
              <FilterSectionHeader section="brands">Marcas</FilterSectionHeader>
              {openFilterSections.brands ? (
                <Stack spacing={0.5}>
                  {brands.map((brand) => {
                    const selected = brand === activeBrand;
                    return (
                      <Button
                        key={brand}
                        variant={selected ? "contained" : "text"}
                        color={selected ? "primary" : "inherit"}
                        size="small"
                        fullWidth
                        onClick={() => setActiveBrand(brand)}
                        sx={{
                          justifyContent: "space-between",
                          textAlign: "left",
                          color: selected ? "#fff" : "text.primary",
                          backgroundColor: selected ? "primary.main" : "transparent",
                          "&:hover": { backgroundColor: selected ? "primary.dark" : "action.hover" }
                        }}
                      >
                        <Box component="span">{brand}</Box>
                        <Typography component="span" variant="body2" fontWeight={700} color="inherit">
                          {brandCounts[brand] || 0}
                        </Typography>
                      </Button>
                    );
                  })}
                </Stack>
              ) : null}
            </div>

            <div className="catalog-filter-group">
              <FilterSectionHeader section="availability">Disponibilidad</FilterSectionHeader>
              {openFilterSections.availability ? (
                <Stack spacing={0.5}>
                  {availabilityOptions.map((status) => {
                    const selected = status === activeAvailability;
                    return (
                      <Button
                        key={status}
                        variant={selected ? "contained" : "text"}
                        color={selected ? "primary" : "inherit"}
                        size="small"
                        fullWidth
                        onClick={() => setActiveAvailability(status)}
                        sx={{
                          justifyContent: "space-between",
                          textAlign: "left",
                          color: selected ? "#fff" : "text.primary",
                          backgroundColor: selected ? "primary.main" : "transparent",
                          "&:hover": { backgroundColor: selected ? "primary.dark" : "action.hover" }
                        }}
                      >
                        <Box component="span">{status === "Todos" ? "Todos" : formatAvailabilityLabel(status)}</Box>
                        <Typography component="span" variant="body2" fontWeight={700} color="inherit">
                          {availabilityCounts[status] || 0}
                        </Typography>
                      </Button>
                    );
                  })}
                </Stack>
              ) : null}
            </div>

            <div className="catalog-filter-group">
              <FilterSectionHeader section="price">Precio máximo</FilterSectionHeader>
              {openFilterSections.price ? (
                <Stack className="price-filter-wrap" spacing={1} sx={{ px: 1 }}>
                  <Slider
                    min={minPrice}
                    max={maxPrice || 1}
                    step={1000}
                    value={maxPriceFilter ?? (maxPrice || 1)}
                    onChange={(_, value) => setMaxPriceFilter(value)}
                    disabled={maxPrice === 0}
                    aria-label="Precio máximo"
                  />
                  <div className="price-filter-values">
                    <Typography variant="caption" color="text.secondary">{maxPrice > 0 ? formatPrice(minPrice) : "Sin precios"}</Typography>
                    <Typography variant="caption" fontWeight={700}>{maxPrice > 0 ? formatPrice(maxPriceFilter ?? maxPrice) : "-"}</Typography>
                  </div>
                </Stack>
              ) : null}
            </div>

            <div className="catalog-filter-group">
              <FilterSectionHeader section="sort">Ordenar por</FilterSectionHeader>
              {openFilterSections.sort ? (
                <TextField select label="Ordenar por" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  <MenuItem value="featured">Destacados</MenuItem>
                  <MenuItem value="price-asc">Menor precio</MenuItem>
                  <MenuItem value="price-desc">Mayor precio</MenuItem>
                  <MenuItem value="name-asc">Nombre A-Z</MenuItem>
                  <MenuItem value="newest">Más recientes</MenuItem>
                </TextField>
              ) : null}
            </div>
          </Stack>
        </Paper>

        <Box component="section" className="catalog-results">
          {isLoading ? (
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2 }}>
              <CircularProgress size={22} />
              <Typography color="text.secondary">Cargando publicaciones...</Typography>
            </Stack>
          ) : null}
          {error ? <Alert severity="error">{error}</Alert> : null}

          {!isLoading && !error ? (
            <div className="catalog-grid">
              {visiblePublications.map((publication, index) => {
                const images = publication.publication_images && publication.publication_images.length > 0
                  ? publication.publication_images
                  : [];
                const defaultImageIndex = Math.max(images.findIndex((image) => image.is_cover), 0);
                const activeImageIndex = activeImageIndexByPublication[publication.id] ?? defaultImageIndex;
                const activeImage = images[activeImageIndex] || images[0];
                const priceLabel = publication.is_price_visible && publication.price != null
                  ? new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: "ARS",
                    maximumFractionDigits: 0
                  }).format(publication.price)
                  : "Consultar precio";
                return (
                    <Card
                      key={publication.id}
                      component="article"
                      className="card publication-card"
                      variant="outlined"
                      elevation={0}
                      style={{ "--card-index": index }}
                      sx={{
                        display: "grid",
                        minWidth: 0,
                        gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(190px, 42%) minmax(0, 1fr)" }
                      }}
                    >
                      <div className="publication-media">
                        {activeImage ? (
                          <img
                            className="publication-image"
                            src={activeImage.image_url}
                            alt={activeImage.alt_text || publication.name}
                          />
                        ) : (
                          <div className="publication-image-placeholder">Sin imagen</div>
                        )}

                        {images.length > 1 ? (
                          <>
                            <IconButton
                              type="button"
                              className="carousel-arrow carousel-arrow-prev"
                              aria-label="Imagen anterior"
                              size="small"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                goToPreviousImage(publication.id, images.length);
                              }}
                            >
                              <ChevronLeft size={20} />
                            </IconButton>
                            <IconButton
                              type="button"
                              className="carousel-arrow carousel-arrow-next"
                              aria-label="Imagen siguiente"
                              size="small"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                goToNextImage(publication.id, images.length);
                              }}
                            >
                              <ChevronRight size={20} />
                            </IconButton>
                            <div className="carousel-dots">
                              {images.map((image, imageIndex) => (
                                <IconButton
                                  key={image.id || imageIndex}
                                  type="button"
                                  className={`carousel-dot ${imageIndex === activeImageIndex ? "active" : ""}`}
                                  aria-label={`Ver imagen ${imageIndex + 1}`}
                                  size="small"
                                  sx={{ width: 8, height: 8, minWidth: 0, p: 0 }}
                                  onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    goToImage(publication.id, imageIndex);
                                  }}
                                />
                              ))}
                            </div>
                          </>
                        ) : null}
                      </div>
                      <CardContent className="publication-body" sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                        <Typography component="h2" variant="h6" fontWeight={750}>{publication.name}</Typography>
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap className="publication-tags">
                          {publication.brand ? <Chip size="small" label={`Marca: ${publication.brand}`} variant="outlined" /> : null}
                          {publication.categories?.name ? <Chip size="small" label={publication.categories.name} /> : null}
                        </Stack>
                        <Typography component="p" color="text.secondary">{publication.description}</Typography>
                        <Stack className="publication-meta" direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                          <Typography component="strong" fontWeight={800}>{priceLabel}</Typography>
                          <Chip
                            size="small"
                            label={formatAvailabilityLabel(publication.availability_status)}
                            color={publication.availability_status === "disponible" ? "success" : publication.availability_status === "sin_stock" ? "error" : "warning"}
                            variant="outlined"
                          />
                        </Stack>
                      </CardContent>
                    </Card>
                );
              })}
            </div>
          ) : null}

          {!isLoading && !error && visiblePublications.length === 0 ? (
            <Paper className="card empty-state" variant="outlined">
              <Typography component="h2" variant="h6" fontWeight={750}>No encontramos resultados</Typography>
              <Typography color="text.secondary">
                Proba limpiar la busqueda o cambiar la categoria para ver mas productos.
              </Typography>
            </Paper>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
