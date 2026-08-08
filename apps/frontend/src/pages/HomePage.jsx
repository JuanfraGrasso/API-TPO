import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <section className="home-page">
      <div className="hero-layout card">
        <div className="hero-copy">
          <span className="eyebrow">Hardware, perifericos y armado de PCs</span>
          <h2>Rendimiento real para tu proxima build</h2>
          <p>
            HardPoint combina componentes premium, asesoramiento tecnico y stock
            actualizado para que armes o mejores tu equipo sin complicaciones.
          </p>

          <div className="hero-actions">
            <Link className="btn btn-primary" to="/catalogo">
              Ver catalogo
            </Link>
            <Link className="btn btn-ghost" to="/contacto">
              Pedir asesoria
            </Link>
          </div>
        </div>

        <aside className="hero-panel">
          <h3>Build Snapshot</h3>
          <ul className="spec-list">
            <li>
              <span>CPU</span>
              <strong>Ryzen 7 5700X</strong>
            </li>
            <li>
              <span>GPU</span>
              <strong>RTX 4060 8GB</strong>
            </li>
            <li>
              <span>RAM</span>
              <strong>32GB DDR5</strong>
            </li>
            <li>
              <span>Storage</span>
              <strong>NVMe 1TB Gen4</strong>
            </li>
          </ul>
        </aside>
      </div>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          <span>HardPoint Builds</span>
          <span>Componentes Reales</span>
          <span>Asesoria Tecnica</span>
          <span>Upgrade Seguro</span>
          <span>HardPoint Builds</span>
          <span>Componentes Reales</span>
          <span>Asesoria Tecnica</span>
          <span>Upgrade Seguro</span>
        </div>
      </div>

      <div className="home-products-grid">
        <article className="card product-family-card">
          <span className="card-label">01</span>
          <h3>Gaming Performance</h3>
          <p>GPUs, CPUs y RAM para equipos de alto FPS y baja latencia.</p>
          <Link className="inline-link" to="/catalogo">
            Ver placas de video
          </Link>
        </article>

        <article className="card product-family-card">
          <span className="card-label">02</span>
          <h3>Productividad Pro</h3>
          <p>Almacenamiento rapido y hardware confiable para trabajo diario.</p>
          <Link className="inline-link" to="/catalogo">
            Ver almacenamiento
          </Link>
        </article>

        <article className="card product-family-card">
          <span className="card-label">03</span>
          <h3>Setup Completo</h3>
          <p>Gabinetes y perifericos para cerrar una build con estilo propio.</p>
          <Link className="inline-link" to="/catalogo">
            Ver perifericos
          </Link>
        </article>
      </div>

      <div className="stats-grid">
        <article className="card stat-card">
          <span>+20</span>
          <p>Productos publicados para buscar y comparar</p>
        </article>
        <article className="card stat-card">
          <span>6</span>
          <p>Categorias para navegar rapido por tipo de componente</p>
        </article>
        <article className="card stat-card">
          <span>100%</span>
          <p>Integrado con datos reales desde Supabase</p>
        </article>
      </div>

      <section className="card cta-band">
        <div>
          <h3>Necesitas ayuda para elegir componentes compatibles?</h3>
          <p>
            Te ayudamos a definir una configuracion equilibrada segun presupuesto,
            uso y posibilidades futuras de upgrade.
          </p>
        </div>
        <Link className="btn btn-primary" to="/contacto">
          Hablar con un asesor
        </Link>
      </section>
    </section>
  );
}
