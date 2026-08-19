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
      {/* HEADER HERO */}
      <div className="contact-hero-banner">
        <span className="eyebrow">Contacto & Asesoramiento</span>
        <h2>¿Tenés dudas sobre tu próximo setup?</h2>
        <p>
          Escribinos a través del formulario o comunicate por nuestros canales oficiales. Te asesoramos en compatibilidad, stock y presupuestos personalizados.
        </p>
      </div>

      <div className="contact-layout-grid">
        {/* COLUMNA IZQUIERDA: CANALES Y UBICACION */}
        <div className="contact-info-column">
          {/* CANALES DE CONTACTO */}
          <article className="card contact-channels-card">
            <div className="contact-card-header">
              <div className="contact-card-icon-title">
                <div className="contact-icon-bubble">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Canales de atención</h3>
                  <p className="contact-card-subtitle">Respuestas rápidas en horario comercial</p>
                </div>
              </div>
            </div>

            <div className="contact-items-list">
              <div className="contact-channel-item">
                <div className="channel-icon-wrap channel-phone">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className="channel-info">
                  <span className="channel-label">Teléfono / WhatsApp</span>
                  <span className="channel-value">+54 11 5555-9090</span>
                </div>
              </div>

              <div className="contact-channel-item">
                <div className="channel-icon-wrap channel-email">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className="channel-info">
                  <span className="channel-label">Correo Electrónico</span>
                  <span className="channel-value">admin@hardpoint.com</span>
                </div>
              </div>

              <div className="contact-channel-item">
                <div className="channel-icon-wrap channel-instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </div>
                <div className="channel-info">
                  <span className="channel-label">Instagram</span>
                  <span className="channel-value">@hardpointpc</span>
                </div>
              </div>

              <div className="contact-channel-item">
                <div className="channel-icon-wrap channel-facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </div>
                <div className="channel-info">
                  <span className="channel-label">Facebook</span>
                  <span className="channel-value">HardPoint PC</span>
                </div>
              </div>

              <div className="contact-channel-item">
                <div className="channel-icon-wrap channel-hours">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="channel-info">
                  <span className="channel-label">Horarios de atención</span>
                  <span className="channel-value">Lun a Vie 09:00 a 19:00 | Sáb 10:00 a 14:00</span>
                </div>
              </div>
            </div>
          </article>

          {/* UBICACION Y MAPA */}
          <article className="card contact-location-card">
            <div className="contact-card-header">
              <div className="contact-card-icon-title">
                <div className="contact-icon-bubble">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Nuestra Ubicación</h3>
                  <p className="contact-card-subtitle">Galerías Pacífico, Av. Córdoba 550, CABA</p>
                </div>
              </div>
            </div>

            <div className="map-container" style={{ marginTop: "0.8rem" }}>
              <iframe
                title="Ubicación Galerías Pacífico"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.015708892187!2d-58.37731762343888!3d-34.59934185750244!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccacc2b10a30b%3A0x6e7888b1f5e884ea!2sGaler%C3%ADas%20Pac%C3%ADfico!5e0!3m2!1ses-419!2sar!4v1710000000000!5m2!1ses-419!2sar"
                width="100%"
                height="220"
                style={{ border: 0, borderRadius: "10px", display: "block" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </article>
        </div>

        {/* COLUMNA DERECHA: FORMULARIO DE CONSULTAS */}
        <div className="contact-form-column">
          <article className="card contact-form-card">
            <div className="contact-form-header">
              <span className="eyebrow">Mensaje directo</span>
              <h3 style={{ margin: "0.2rem 0 0.4rem" }}>Envianos tu consulta</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", margin: 0 }}>
                Completá los datos y un asesor técnico te responderá a la brevedad.
              </p>
            </div>

            <form className="contact-form" onSubmit={handleSubmit} style={{ marginTop: "1.2rem" }}>
              <div className="form-grid">
                <label className={`form-field ${touched.fullName && errors.fullName ? "form-field-invalid" : ""}`}>
                  <span>Nombre completo *</span>
                  <input
                    name="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej: Juan Pérez"
                    disabled={isSubmitting}
                  />
                  {touched.fullName && errors.fullName ? <small>{errors.fullName}</small> : null}
                </label>

                <label className={`form-field ${touched.email && errors.email ? "form-field-invalid" : ""}`}>
                  <span>Email de contacto *</span>
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
                  <span>Teléfono</span>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej: +54 11 1234-5678"
                    disabled={isSubmitting}
                  />
                </label>

                <label className={`form-field ${touched.subject && errors.subject ? "form-field-invalid" : ""}`}>
                  <span>Asunto *</span>
                  <input
                    name="subject"
                    type="text"
                    value={form.subject}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej: Compatibilidad de fuente y GPU"
                    disabled={isSubmitting}
                  />
                  {touched.subject && errors.subject ? <small>{errors.subject}</small> : null}
                </label>
              </div>

              <label className={`form-field form-field-full ${touched.message && errors.message ? "form-field-invalid" : ""}`} style={{ marginTop: "0.8rem" }}>
                <span>Mensaje o Consulta técnica *</span>
                <textarea
                  name="message"
                  rows="6"
                  value={form.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Contanos qué componentes estás buscando, presupuesto aproximado o cualquier duda técnica..."
                  disabled={isSubmitting}
                />
                <div className="form-field-meta">
                  {touched.message && errors.message ? <small>{errors.message}</small> : <small>Mínimo sugerido: 20 caracteres.</small>}
                  <small>{form.message.trim().length} caracteres</small>
                </div>
              </label>

              {submitError ? <p className="form-feedback form-feedback-error">{submitError}</p> : null}
              {submitSuccess ? <p className="form-feedback form-feedback-success">{submitSuccess}</p> : null}

              <button className="btn btn-primary btn-submit-contact" type="submit" disabled={isSubmitting || !isFormValid}>
                {isSubmitting ? (
                  "Enviando consulta..."
                ) : (
                  <>
                    <span>Enviar consulta</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </article>
        </div>
      </div>
    </section>
  );
}
