import { useEffect, useState } from "react";
import { Alert, Box, Button, Card, Chip, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import { Camera, Clock3, Mail, MapPin, Phone, Send, Share2 } from "lucide-react";
import { createInquiry, getCommerceProfile } from "../services/api";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  subject: "",
  message: ""
};

const initialCommerceProfile = {
  business_name: "HardPoint Computacion",
  address: "",
  phone: "",
  instagram_url: "",
  facebook_url: "",
  business_hours: ""
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
  const [commerceProfile, setCommerceProfile] = useState(initialCommerceProfile);
  const errors = validateForm(form);
  const isFormValid = Object.keys(errors).length === 0;

  useEffect(() => {
    let active = true;

    getCommerceProfile()
      .then((result) => {
        if (active && result.data) {
          setCommerceProfile((current) => ({ ...current, ...result.data }));
        }
      })
      .catch(() => {
      });

    return () => {
      active = false;
    };
  }, []);

  function getSocialLabel(url, fallback) {
    if (!url) return fallback;
    try {
      return new URL(url).pathname.replace(/^\/+|\/+$/g, "") || fallback;
    } catch {
      return url;
    }
  }

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

  const contactChannels = [
    { label: "Teléfono / WhatsApp", value: commerceProfile.phone || "No informado", className: "channel-phone", Icon: Phone },
    { label: "Correo electrónico", value: "admin@hardpoint.com", className: "channel-email", Icon: Mail },
    { label: "Instagram", value: getSocialLabel(commerceProfile.instagram_url, "No informado"), className: "channel-instagram", Icon: Camera },
    { label: "Facebook", value: getSocialLabel(commerceProfile.facebook_url, "No informado"), className: "channel-facebook", Icon: Share2 },
    { label: "Horarios de atención", value: commerceProfile.business_hours || "No informado", className: "channel-hours", Icon: Clock3 }
  ];

  return (
    <Box component="section" className="contact-page">
      <Card className="contact-hero-banner" variant="outlined" elevation={0}>
        <Chip label="Contacto y asesoramiento" color="primary" variant="outlined" sx={{ alignSelf: "flex-start" }} />
        <Typography component="h1" variant="h4" fontWeight={800} sx={{ fontSize: { xs: "1.65rem", sm: "2.125rem" }, lineHeight: 1.2 }}>
          ¿Tenés dudas sobre tu próximo setup?
        </Typography>
        <Typography color="text.secondary">
          Escribinos a través del formulario o comunicate por nuestros canales oficiales. Te asesoramos en compatibilidad, stock y presupuestos personalizados.
        </Typography>
      </Card>

      <Box className="contact-layout-grid">
        <Stack className="contact-info-column">
          <Card className="contact-channels-card" variant="outlined" elevation={0}>
            <Stack className="contact-card-header" direction="row" spacing={1.5} alignItems="center">
              <Box className="contact-icon-bubble"><Phone size={20} /></Box>
              <Box>
                <Typography component="h2" variant="h6" fontWeight={750}>Canales de atención</Typography>
                <Typography className="contact-card-subtitle" color="text.secondary">Respuestas rápidas en horario comercial</Typography>
              </Box>
            </Stack>
            <Stack className="contact-items-list">
              {contactChannels.map(({ label, value, className, Icon }) => (
                <Box className="contact-channel-item" key={label}>
                  <Box className={`channel-icon-wrap ${className}`}><Icon size={18} /></Box>
                  <Box className="channel-info">
                    <Typography component="span" className="channel-label">{label}</Typography>
                    <Typography component="span" className="channel-value">{value}</Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Card>

          <Card className="contact-location-card" variant="outlined" elevation={0}>
            <Stack className="contact-card-header" direction="row" spacing={1.5} alignItems="center">
              <Box className="contact-icon-bubble"><MapPin size={20} /></Box>
              <Box>
                <Typography component="h2" variant="h6" fontWeight={750}>Nuestra ubicación</Typography>
                <Typography className="contact-card-subtitle" color="text.secondary">
                  {commerceProfile.address || "Dirección no informada"}
                </Typography>
              </Box>
            </Stack>
            <Box className="map-container" sx={{ mt: 1.5 }}>
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
            </Box>
          </Card>
        </Stack>

        <Box className="contact-form-column">
          <Card className="contact-form-card" variant="outlined" elevation={0}>
            <Box className="contact-form-header">
              <Typography component="h2" variant="h5" fontWeight={800}>Envianos tu consulta</Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                Completá los datos y un asesor técnico te responderá a la brevedad.
              </Typography>
            </Box>

            <Box component="form" className="contact-form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Box className="form-grid">
                  <TextField
                    name="fullName"
                    label="Nombre completo"
                    type="text"
                    value={form.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej: Juan Pérez"
                    disabled={isSubmitting}
                    error={Boolean(touched.fullName && errors.fullName)}
                    helperText={touched.fullName ? errors.fullName : " "}
                    required
                  />
                  <TextField
                    name="email"
                    label="Email de contacto"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="tu@email.com"
                    disabled={isSubmitting}
                    error={Boolean(touched.email && errors.email)}
                    helperText={touched.email ? errors.email : " "}
                    required
                  />
                  <TextField
                    name="phone"
                    label="Teléfono"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej: +54 11 1234-5678"
                    disabled={isSubmitting}
                  />
                  <TextField
                    name="subject"
                    label="Asunto"
                    type="text"
                    value={form.subject}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej: Compatibilidad de fuente y GPU"
                    disabled={isSubmitting}
                    error={Boolean(touched.subject && errors.subject)}
                    helperText={touched.subject ? errors.subject : " "}
                    required
                  />
              </Box>

              <TextField
                className="form-field-full"
                  name="message"
                label="Mensaje o consulta técnica"
                multiline
                minRows={6}
                  value={form.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Contanos qué componentes estás buscando, presupuesto aproximado o cualquier duda técnica..."
                  disabled={isSubmitting}
                error={Boolean(touched.message && errors.message)}
                helperText={touched.message && errors.message ? errors.message : "Mínimo sugerido: 20 caracteres."}
                required
                />
              <Typography variant="caption" color="text.secondary" textAlign="right">
                {form.message.trim().length} caracteres
              </Typography>

              {submitError ? <Alert severity="error">{submitError}</Alert> : null}
              {submitSuccess ? <Alert severity="success">{submitSuccess}</Alert> : null}

              <Button className="btn-submit-contact" variant="contained" type="submit" disabled={isSubmitting || !isFormValid} startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <Send size={18} />}>
                {isSubmitting ? "Enviando consulta..." : "Enviar consulta"}
              </Button>
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
