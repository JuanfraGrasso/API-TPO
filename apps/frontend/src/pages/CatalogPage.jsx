import { useEffect, useState } from "react";
import { getPublications } from "../services/api";

export default function CatalogPage() {
  const [publications, setPublications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todas");
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

  const visiblePublications = publications.filter((publication) => {
    const matchesCategory = activeCategory === "Todas"
      || publication.categories?.name === activeCategory;
    const searchableText = `${publication.name} ${publication.brand || ""} ${publication.sku || ""}`
      .toLowerCase();
    const matchesSearch = searchableText.includes(searchTerm.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="catalog-page">
      <div className="card catalog-hero">
        <h2>Catalogo</h2>
        <p>Explora hardware, perifericos y componentes disponibles en nuestra tienda.</p>
      </div>

      <section className="card catalog-toolbar">
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

        <div className="catalog-filters-group">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={category === activeCategory ? "filter-pill active" : "filter-pill"}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

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
              <article key={publication.id} className="card publication-card">
                {coverImage ? (
                  <img
                    className="publication-image"
                    src={coverImage.image_url}
                    alt={coverImage.alt_text || publication.name}
                  />
                ) : null}

                <div className="publication-body">
                  <span className="publication-category">
                    {publication.categories?.name || "Sin categoria"}
                  </span>
                  <h3>{publication.name}</h3>
                  <div className="publication-tags">
                    {publication.brand ? <span>Marca: {publication.brand}</span> : null}
                    {publication.sku ? <span>SKU: {publication.sku}</span> : null}
                  </div>
                  <p>{publication.description}</p>
                  <div className="publication-meta">
                    <strong>{priceLabel}</strong>
                    <span className={availabilityClass}>{publication.availability_status}</span>
                  </div>
                </div>
              </article>
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
  );
}
