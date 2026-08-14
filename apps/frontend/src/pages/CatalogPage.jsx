import { useEffect, useState } from "react";
import { getPublications } from "../services/api";

export default function CatalogPage() {
  const [publications, setPublications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [activeBrand, setActiveBrand] = useState("Todas");
  const [activeAvailability, setActiveAvailability] = useState("Todos");
  const [sortBy, setSortBy] = useState("featured");
  const [maxPriceFilter, setMaxPriceFilter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
    <section className="catalog-page catalog-page-wide">
      <div className="catalog-layout">
        <aside className="card catalog-sidebar">
          <h2 className="catalog-title">Catalogo</h2>

          <div className="catalog-search-group">
            <label htmlFor="catalog-search">Buscar</label>
            <input
              id="catalog-search"
              type="search"
              placeholder="Ej: RTX 4060, Kingston, SSD..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="catalog-filter-group">
            <h3>Categorias</h3>
            <div className="catalog-filters-list">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={category === activeCategory ? "filter-row active" : "filter-row"}
                  onClick={() => setActiveCategory(category)}
                >
                  <span>{category}</span>
                  <span>{categoryCounts[category] || 0}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="catalog-filter-group">
            <h3>Marcas</h3>
            <div className="catalog-filters-list">
              {brands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  className={brand === activeBrand ? "filter-row active" : "filter-row"}
                  onClick={() => setActiveBrand(brand)}
                >
                  <span>{brand}</span>
                  <span>{brandCounts[brand] || 0}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="catalog-filter-group">
            <h3>Disponibilidad</h3>
            <div className="catalog-filters-list">
              {availabilityOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  className={status === activeAvailability ? "filter-row active" : "filter-row"}
                  onClick={() => setActiveAvailability(status)}
                >
                  <span>{status === "Todos" ? "Todos" : formatAvailabilityLabel(status)}</span>
                  <span>{availabilityCounts[status] || 0}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="catalog-filter-group">
            <h3>Precio maximo</h3>
            <div className="price-filter-wrap">
              <input
                type="range"
                min={minPrice}
                max={maxPrice || 1}
                step="1000"
                value={maxPriceFilter ?? (maxPrice || 1)}
                onChange={(event) => setMaxPriceFilter(Number(event.target.value))}
                disabled={maxPrice === 0}
              />
              <div className="price-filter-values">
                <span>{maxPrice > 0 ? formatPrice(minPrice) : "Sin precios"}</span>
                <strong>{maxPrice > 0 ? formatPrice(maxPriceFilter ?? maxPrice) : "-"}</strong>
              </div>
            </div>
          </div>

          <div className="catalog-filter-group">
            <h3>Ordenar por</h3>
            <div className="sort-options">
              <label className="sort-option">
                <input
                  type="radio"
                  name="catalog-sort"
                  value="featured"
                  checked={sortBy === "featured"}
                  onChange={() => setSortBy("featured")}
                />
                <span>Destacados</span>
              </label>
              <label className="sort-option">
                <input
                  type="radio"
                  name="catalog-sort"
                  value="price-asc"
                  checked={sortBy === "price-asc"}
                  onChange={() => setSortBy("price-asc")}
                />
                <span>Menor precio</span>
              </label>
              <label className="sort-option">
                <input
                  type="radio"
                  name="catalog-sort"
                  value="price-desc"
                  checked={sortBy === "price-desc"}
                  onChange={() => setSortBy("price-desc")}
                />
                <span>Mayor precio</span>
              </label>
              <label className="sort-option">
                <input
                  type="radio"
                  name="catalog-sort"
                  value="name-asc"
                  checked={sortBy === "name-asc"}
                  onChange={() => setSortBy("name-asc")}
                />
                <span>Nombre A-Z</span>
              </label>
              <label className="sort-option">
                <input
                  type="radio"
                  name="catalog-sort"
                  value="newest"
                  checked={sortBy === "newest"}
                  onChange={() => setSortBy("newest")}
                />
                <span>Mas recientes</span>
              </label>
            </div>
          </div>
        </aside>

        <section className="catalog-results">
          <div className="catalog-results-head">
            <h3>{activeCategory === "Todas" ? "Todos los productos" : activeCategory}</h3>
            <p>{visiblePublications.length} resultados</p>
          </div>

          {isLoading ? <p>Cargando publicaciones...</p> : null}
          {error ? <p className="error-message">{error}</p> : null}

          {!isLoading && !error ? (
            <div className="catalog-grid">
              {visiblePublications.map((publication) => {
                const coverImage = publication.publication_images?.find((image) => image.is_cover)
                  || publication.publication_images?.[0];
                const priceLabel = publication.is_price_visible && publication.price != null
                  ? new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: "ARS",
                    maximumFractionDigits: 0
                  }).format(publication.price)
                  : "Consultar precio";
                const availabilityClass = `status-badge status-${publication.availability_status}`;

                return (
                  <>
                    <article key={publication.id} className="card publication-card">
                      {coverImage ? (
                        <img
                          className="publication-image"
                          src={coverImage.image_url}
                          alt={coverImage.alt_text || publication.name}
                        />
                      ) : null}
                    </article>
                    <div className="publication-body">
                      <h3>{publication.name}</h3>
                      <div className="publication-tags">
                        {publication.brand ? <span>Marca: {publication.brand}</span> : null}
                      </div>
                      <p>{publication.description}</p>
                      <div className="publication-meta">
                        <strong>{priceLabel}</strong>
                        <span className={availabilityClass}>{publication.availability_status}</span>
                      </div>
                    </div>
                  </>
                );
              })}
            </div>
          ) : null}

          {!isLoading && !error && visiblePublications.length === 0 ? (
            <div className="card empty-state">
              <h3>No encontramos resultados</h3>
              <p>
                Proba limpiar la busqueda o cambiar la categoria para ver mas productos.
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}
