import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <section className="home-page">
      <article className="hero-banner card">
        <img
          className="hero-banner-image"
          src="/background.jpg"
          alt="Notebook gamer sobre escritorio oscuro"
        />
        <div className="hero-banner-overlay" />
        <div className="hero-banner-content">
          <h2>
            Equipos listos
            <span className="hero-title-accent"> para rendir de verdad</span>
          </h2>
          <p>
            HardPoint combina componentes premium, asesoramiento tecnico y stock
            actualizado para que armes o mejores tu equipo sin complicaciones.
          </p>

          <div className="hero-banner-actions">
            <Link className="btn btn-primary" to="/catalogo">
              Ver catalogo
            </Link>
            <Link className="btn btn-hero-secondary" to="/contacto">
              Pedir asesoria
            </Link>
          </div>
        </div>
      </article>

      <section className="sliding-strip" aria-label="Novedades HardPoint">
        <div className="sliding-strip-track">
          <p className="sliding-strip-text">
            HARDPOINT <span className="sliding-strip-accent">NEXT GEN</span> 2026
            <span className="sliding-strip-chip">
              [ CPU <img className="sliding-strip-icon" src="/cpu-logo.jpg" alt="CPU" /> ]
            </span>
            <span className="sliding-strip-chip">
              [ RAM <img className="sliding-strip-icon" src="/ram-logo.jpg" alt="RAM" /> ]
            </span>
            <span className="sliding-strip-chip">
              [ GPU <img className="sliding-strip-icon" src="/gpu-logo.jpg" alt="GPU" /> ]
            </span>
            <span className="sliding-strip-accent"> TODO PARA TU BUILD</span>
          </p>
          <p className="sliding-strip-text" aria-hidden="true">
            HARDPOINT <span className="sliding-strip-accent">NEXT GEN</span> 2026
            <span className="sliding-strip-chip">
              [ CPU <img className="sliding-strip-icon" src="/cpu-logo.jpg" alt="" aria-hidden="true" /> ]
            </span>
            <span className="sliding-strip-chip">
              [ RAM <img className="sliding-strip-icon" src="/ram-logo.jpg" alt="" aria-hidden="true" /> ]
            </span>
            <span className="sliding-strip-chip">
              [ GPU <img className="sliding-strip-icon" src="/gpu-logo.jpg" alt="" aria-hidden="true" /> ]
            </span>
            <span className="sliding-strip-accent"> TODO PARA TU BUILD</span>
          </p>
        </div>
      </section>

      <section className="home-cards-stack">
        <article className="card showcase-card">
          <img
            className="showcase-image"
            src="https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?auto=format&fit=crop&w=1200&q=80"
            alt="Placa de video de alto rendimiento"
          />
          <div className="showcase-content">
            <span className="card-label">Gaming</span>
            <h3>Configura hoy. Mejora cuando quieras.</h3>
            <p>
              GPUs, memorias y almacenamiento seleccionados para dar el salto de
              rendimiento sin rehacer toda tu PC.
            </p>
            <Link className="btn btn-primary" to="/catalogo">
              Ver componentes
            </Link>
          </div>
        </article>

        <article className="card showcase-card showcase-card-reverse">
          <img
            className="showcase-image"
            src="https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80"
            alt="Mesa de trabajo con componentes de computadora"
          />
          <div className="showcase-content">
            <span className="card-label">Productividad</span>
            <h3>Armados balanceados para estudio y trabajo</h3>
            <p>
              Te ayudamos a definir una build estable para jornadas largas,
              multitarea y crecimiento futuro de tu setup.
            </p>
            <Link className="btn btn-ghost" to="/contacto">
              Pedir recomendacion
            </Link>
          </div>
        </article>

        <article className="card showcase-card">
          <img
            className="showcase-image"
            src="https://images.unsplash.com/photo-1587202372616-b43abea06c2a?auto=format&fit=crop&w=1200&q=80"
            alt="Teclado mecanico y mouse sobre escritorio"
          />
          <div className="showcase-content">
            <span className="card-label">Perifericos</span>
            <h3>Un setup completo en una sola tienda</h3>
            <p>
              Monitores, teclados y mouse para cerrar una experiencia comoda,
              consistente y lista para usar desde el primer dia.
            </p>
            <Link className="btn btn-primary" to="/catalogo">
              Explorar catalogo
            </Link>
          </div>
        </article>
      </section>

      <section className="card info-banner">
        <div>
          <span className="card-label">Next Gen Event</span>
          <h3>Todo nuestro catalogo apunta a upgrade modular</h3>
        </div>
        <p>
          Elegis una base solida hoy y mejoras por partes cuando lo necesites,
          sin tirar tu inversion inicial.
        </p>
      </section>

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
