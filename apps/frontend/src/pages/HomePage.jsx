import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <section className="home-page">
      <div className="card hero-card">
        <span className="eyebrow">Hardware, perifericos y armado de PCs</span>
        <h2>Tu proximo upgrade empieza en HardPoint</h2>
        <p>
          Encontra componentes para gaming, estudio y trabajo: procesadores,
          placas de video, memorias, almacenamiento, gabinetes y accesorios.
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

      <div className="home-grid">
        <article className="card">
          <h3>Que ofrecemos</h3>
          <p>
            Venta de hardware seleccionado, armado de equipos a medida y
            asesoramiento para elegir la mejor configuracion segun tu presupuesto.
          </p>
        </article>

        <article className="card">
          <h3>Categorias destacadas</h3>
          <ul className="feature-list">
            <li>Procesadores AMD e Intel</li>
            <li>Placas de video NVIDIA y AMD</li>
            <li>Memorias RAM DDR4 y DDR5</li>
            <li>SSD NVMe, SATA y discos rigidos</li>
            <li>Gabinetes gamer y perifericos</li>
          </ul>
        </article>

        <article className="card">
          <h3>Atencion</h3>
          <p>Lun a Vie de 10:00 a 19:00 y Sab de 10:00 a 14:00.</p>
          <p>Av. Tecnologia 742, Ciudad.</p>
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
    </section>
  );
}
