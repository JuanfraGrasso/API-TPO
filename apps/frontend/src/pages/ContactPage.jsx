export default function ContactPage() {
  return (
    <section className="contact-page">
      <div className="card">
        <h2>Contacto</h2>
        <p>
          Escribinos para consultar stock, pedir una cotizacion o recibir ayuda
          para armar tu PC ideal.
        </p>
      </div>

      <div className="contact-grid">
        <article className="card">
          <h3>Canales de contacto</h3>
          <ul className="feature-list">
            <li>Telefono: +54 11 5555-9090</li>
            <li>Email: admin@hardpoint.com</li>
            <li>Instagram: @hardpointpc</li>
            <li>Facebook: HardPoint PC</li>
          </ul>
        </article>

        <article className="card">
          <h3>Consultas frecuentes</h3>
          <p>
            Podemos ayudarte con compatibilidad entre componentes, armado de PC,
            upgrade de notebooks y disponibilidad de productos gamer.
          </p>
        </article>
      </div>
    </section>
  );
}
