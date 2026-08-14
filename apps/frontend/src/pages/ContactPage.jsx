import { useState } from "react";
import { createInquiry } from "../services/api";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  subject: "",
  message: ""
};

function validateForm(form) {
  const errors = {};

  if (!form.fullName.trim()) {
    errors.fullName = "Ingresa tu nombre completo.";
  }

  if (!form.email.trim()) {
    errors.email = "Ingresa un email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Ingresa un email valido.";
  }

  if (!form.subject.trim()) {
    errors.subject = "Ingresa un asunto.";
  }

  if (!form.message.trim()) {
    errors.message = "Escribe tu consulta.";
  } else if (form.message.trim().length < 20) {
    errors.message = "Agrega un poco mas de detalle para ayudarte mejor.";
  }

  return errors;
}

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const errors = validateForm(form);
  const isFormValid = Object.keys(errors).length === 0;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    setTouched({
      fullName: true,
      email: true,
      phone: true,
      subject: true,
      message: true
    });

    if (!isFormValid) {
      setSubmitError("Revisa los campos marcados antes de enviar.");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await createInquiry(form);
      setSubmitSuccess(result.message || "Consulta enviada correctamente.");
      setForm(initialForm);
      setTouched({});
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="contact-page">

      <div className="contact-grid">

        <article className="card">
          <h3>Nuestra Ubicación</h3>
          <p style={{ marginBottom: "1rem", color: "var(--text-muted, #666)" }}>
            Galerías Pacífico, CABA
          </p>
          <div className="map-container">
            <iframe
              title="Ubicación Galerías Pacífico"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.015708892187!2d-58.37731762343888!3d-34.59934185750244!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccacc2b10a30b%3A0x6e7888b1f5e884ea!2sGaler%C3%ADas%20Pac%C3%ADfico!5e0!3m2!1ses-419!2sar!4v1710000000000!5m2!1ses-419!2sar"
              width="100%"
              height="320"
              style={{ border: 0, borderRadius: "12px" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </article>

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
          <h3>Envianos tu consulta</h3>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className={`form-field ${touched.fullName && errors.fullName ? "form-field-invalid" : ""}`}>
                <span>Nombre completo</span>
                <input
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Tu nombre"
                  disabled={isSubmitting}
                />
                {touched.fullName && errors.fullName ? <small>{errors.fullName}</small> : null}
              </label>

              <label className={`form-field ${touched.email && errors.email ? "form-field-invalid" : ""}`}>
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="tu@email.com"
                  disabled={isSubmitting}
                />
                {touched.email && errors.email ? <small>{errors.email}</small> : null}
              </label>

              <label className="form-field">
                <span>Telefono</span>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Opcional"
                  disabled={isSubmitting}
                />
              </label>

              <label className={`form-field ${touched.subject && errors.subject ? "form-field-invalid" : ""}`}>
                <span>Asunto</span>
                <input
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Motivo de la consulta"
                  disabled={isSubmitting}
                />
                {touched.subject && errors.subject ? <small>{errors.subject}</small> : null}
              </label>
            </div>

            <label className={`form-field form-field-full ${touched.message && errors.message ? "form-field-invalid" : ""}`}>
              <span>Mensaje</span>
              <textarea
                name="message"
                rows="5"
                value={form.message}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Contanos que estas buscando o que compatibilidad necesitas revisar"
                disabled={isSubmitting}
              />
              <div className="form-field-meta">
                {touched.message && errors.message ? <small>{errors.message}</small> : <small>Minimo sugerido: 20 caracteres.</small>}
                <small>{form.message.trim().length} caracteres</small>
              </div>
            </label>

            {submitError ? <p className="form-feedback form-feedback-error">{submitError}</p> : null}
            {submitSuccess ? <p className="form-feedback form-feedback-success">{submitSuccess}</p> : null}

            <button className="btn btn-primary" type="submit" disabled={isSubmitting || !isFormValid}>
              {isSubmitting ? "Enviando..." : "Enviar consulta"}
            </button>
          </form>
        </article>
      </div>
    </section>
  );
}
