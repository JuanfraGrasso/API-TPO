import { useEffect, useState } from "react";
import { getPublications } from "../services/api";

export default function CatalogPage() {
  const [publications, setPublications] = useState([]);
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

  return (
    <section className="catalog-page">
      <div className="card catalog-hero">
        <h2>Catalogo</h2>
        <p>Explora hardware, perifericos y componentes disponibles en nuestra tienda.</p>
      </div>

      {isLoading ? <p>Cargando publicaciones...</p> : null}
      {error ? <p className="error-message">{error}</p> : null}

      {!isLoading && !error ? (
        <div className="catalog-grid">
          {publications.map((publication) => {
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
    </section>
  );
}
