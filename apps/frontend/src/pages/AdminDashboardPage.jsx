import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearAdminSession,
  createPublication,
  deletePublication,
  getAdminInquiries,
  getAdminPublications,
  getAdminSession,
  getCategories,
  getStoredAdminProfile,
  getStoredAdminSession,
  registerAdmin,
  updateInquiryStatus,
  updatePublication
} from "../services/api";

const initialPubForm = {
  name: "",
  category_id: "",
  brand: "",
  sku: "",
  price: "",
  is_price_visible: true,
  availability_status: "disponible",
  image_url: "",
  description: "",
  is_active: true
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(getStoredAdminProfile());
  const [activeTab, setActiveTab] = useState("publications");

  // Data states
  const [publications, setPublications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inquiries, setInquiries] = useState([]);

  // Loaders & errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Publication Form states
  const [showPubForm, setShowPubForm] = useState(false);
  const [editingPubId, setEditingPubId] = useState(null);
  const [pubForm, setPubForm] = useState(initialPubForm);
  const [pubSubmitting, setPubSubmitting] = useState(false);
  const [pubFeedback, setPubFeedback] = useState("");
  const [pubFeedbackType, setPubFeedbackType] = useState("info");

  // Inquiry Status Updating states
  const [updatingInquiryId, setUpdatingInquiryId] = useState(null);
  const [inquiryFeedback, setInquiryFeedback] = useState("");

  // Admin Register Form states
  const [createLoading, setCreateLoading] = useState(false);
  const [createFeedback, setCreateFeedback] = useState("");
  const [createFeedbackType, setCreateFeedbackType] = useState("info");
  const [newAdmin, setNewAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: ""
  });

  useEffect(() => {
    const token = getStoredAdminSession();

    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }

    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        const session = await getAdminSession(token);

        if (!active) return;
        setAdmin(session.admin);

        const [inquiryRes, pubRes, catRes] = await Promise.allSettled([
          getAdminInquiries(token),
          getAdminPublications(),
          getCategories()
        ]);

        if (!active) return;

        if (inquiryRes.status === "fulfilled") {
          setInquiries(inquiryRes.value.data || []);
        }
        if (pubRes.status === "fulfilled") {
          setPublications(pubRes.value.data || []);
        }
        if (catRes.status === "fulfilled") {
          setCategories(catRes.value.data || []);
        }
      } catch (requestError) {
        if (!active) return;
        clearAdminSession();
        navigate("/admin/login", { replace: true });
        setError(requestError.message || "No se pudo cargar el panel.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [navigate]);

  function handleLogout() {
    clearAdminSession();
    navigate("/admin/login", { replace: true });
  }

  // Publication Handlers
  function handleOpenCreatePub() {
    setEditingPubId(null);
    setPubForm(initialPubForm);
    setPubFeedback("");
    setShowPubForm(true);
  }

  function handleOpenEditPub(pub) {
    const coverImage = pub.publication_images?.find((img) => img.is_cover)?.image_url
      || pub.publication_images?.[0]?.image_url
      || "";

    setEditingPubId(pub.id);
    setPubForm({
      name: pub.name || "",
      category_id: pub.category_id || pub.categories?.id || "",
      brand: pub.brand || "",
      sku: pub.sku || "",
      price: pub.price != null ? String(pub.price) : "",
      is_price_visible: pub.is_price_visible ?? true,
      availability_status: pub.availability_status || "disponible",
      image_url: coverImage,
      description: pub.description || "",
      is_active: pub.is_active ?? true
    });
    setPubFeedback("");
    setShowPubForm(true);
  }

  function handleCancelPubForm() {
    setShowPubForm(false);
    setEditingPubId(null);
    setPubForm(initialPubForm);
    setPubFeedback("");
  }

  async function handleSavePublication(event) {
    event.preventDefault();
    const token = getStoredAdminSession();

    if (!token || pubSubmitting) return;

    if (!pubForm.name.trim() || !pubForm.category_id || !pubForm.description.trim()) {
      setPubFeedbackType("error");
      setPubFeedback("Completa el nombre, la categoria y la descripcion.");
      return;
    }

    try {
      setPubSubmitting(true);
      setPubFeedback("");

      const payload = {
        name: pubForm.name.trim(),
        category_id: Number(pubForm.category_id),
        brand: pubForm.brand.trim() || null,
        sku: pubForm.sku.trim() || null,
        price: pubForm.price !== "" ? Number(pubForm.price) : null,
        is_price_visible: pubForm.is_price_visible,
        availability_status: pubForm.availability_status,
        image_url: pubForm.image_url.trim() || null,
        description: pubForm.description.trim(),
        is_active: pubForm.is_active
      };

      if (editingPubId) {
        const response = await updatePublication(editingPubId, payload, token);
        setPublications((prev) =>
          prev.map((p) => (p.id === editingPubId ? response.data : p))
        );
        setPubFeedbackType("success");
        setPubFeedback("Publicacion actualizada correctamente.");
      } else {
        const response = await createPublication(payload, token);
        setPublications((prev) => [response.data, ...prev]);
        setPubFeedbackType("success");
        setPubFeedback("Publicacion creada correctamente.");
      }

      setShowPubForm(false);
      setEditingPubId(null);
      setPubForm(initialPubForm);
    } catch (err) {
      setPubFeedbackType("error");
      setPubFeedback(err.message || "Error al guardar la publicacion.");
    } finally {
      setPubSubmitting(false);
    }
  }

  async function handleDeletePublication(id) {
    const token = getStoredAdminSession();
    if (!token) return;

    if (!window.confirm("¿Seguro que deseas desactivar/eliminar esta publicacion?")) {
      return;
    }

    try {
      await deletePublication(id, token);
      setPublications((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_active: false } : p))
      );
      setPubFeedbackType("success");
      setPubFeedback("Publicacion desactivada correctamente.");
    } catch (err) {
      setPubFeedbackType("error");
      setPubFeedback(err.message || "No se pudo eliminar la publicacion.");
    }
  }

  // Inquiry Status Handler
  async function handleChangeInquiryStatus(id, newStatus) {
    const token = getStoredAdminSession();
    if (!token) return;

    try {
      setUpdatingInquiryId(id);
      setInquiryFeedback("");

      const response = await updateInquiryStatus(id, newStatus, token);
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status: response.data.status } : inq))
      );
      setInquiryFeedback("Estado de la consulta actualizado.");
    } catch (err) {
      setInquiryFeedback(err.message || "No se pudo cambiar el estado.");
    } finally {
      setUpdatingInquiryId(null);
    }
  }

  // Admin Register Handler
  async function handleCreateAdmin(event) {
    event.preventDefault();
    const token = getStoredAdminSession();

    if (!token || createLoading) return;

    setCreateLoading(true);
    setCreateFeedback("");

    try {
      await registerAdmin(newAdmin, token);
      setCreateFeedbackType("success");
      setCreateFeedback("Administrador creado correctamente.");
      setNewAdmin({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: ""
      });
    } catch (requestError) {
      setCreateFeedbackType("error");
      setCreateFeedback(requestError.message || "No se pudo crear el administrador.");
    } finally {
      setCreateLoading(false);
    }
  }

  function formatPrice(val) {
    if (val == null) return "Consultar";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }).format(val);
  }

  return (
    <section className="admin-page-wide">
      {loading ? <p>Cargando panel...</p> : null}
      {error ? <p className="form-feedback form-feedback-error">{error}</p> : null}

      {!loading ? (
        <div className="admin-dashboard-layout">
          {/* PANEL PRINCIPAL (IZQUIERDA - ANCHO COMPLETO DISPONIBLE) */}
          <div className="card admin-main-card">
            <div className="admin-dashboard-header">
              <div>
                <span className="eyebrow">Panel interno</span>
                <h2>Panel Administrador</h2>
                <p>
                  {admin ? `Sesión activa de ${admin.firstName} ${admin.lastName}` : "Gestión del comercio."}
                </p>
              </div>

              <button className="btn btn-ghost" type="button" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>

            {/* PESTAÑAS PRINCIPALES */}
            <div className="admin-tabs">
              <button
                className={`admin-tab-btn ${activeTab === "publications" ? "active" : ""}`}
                onClick={() => setActiveTab("publications")}
              >
                Productos ({publications.length})
              </button>
              <button
                className={`admin-tab-btn ${activeTab === "inquiries" ? "active" : ""}`}
                onClick={() => setActiveTab("inquiries")}
              >
                Consultas ({inquiries.length})
              </button>
            </div>

            {pubFeedback ? (
              <p className={`form-feedback form-feedback-${pubFeedbackType}`}>{pubFeedback}</p>
            ) : null}

            {/* TAB 1: PRODUCTOS */}
            {activeTab === "publications" ? (
              <div className="admin-tab-content">
                <div className="admin-section-header">
                  <h3>Publicaciones de Productos</h3>
                  {!showPubForm ? (
                    <button className="btn btn-primary" onClick={handleOpenCreatePub}>
                      + Nuevo Producto
                    </button>
                  ) : null}
                </div>

                {/* FORMULARIO DE PRODUCTO (CREAR / EDITAR) */}
                {showPubForm ? (
                  <article className="publication-form-card">
                    <h4>{editingPubId ? "Editar Producto" : "Nuevo Producto"}</h4>
                    <form onSubmit={handleSavePublication}>
                      <div className="form-grid">
                        <label className="form-field">
                          <span>Nombre *</span>
                          <input
                            type="text"
                            value={pubForm.name}
                            onChange={(e) => setPubForm({ ...pubForm, name: e.target.value })}
                            placeholder="Ej: RTX 4060 Ti 8GB"
                            required
                          />
                        </label>

                        <label className="form-field">
                          <span>Categoría *</span>
                          <select
                            value={pubForm.category_id}
                            onChange={(e) => setPubForm({ ...pubForm, category_id: e.target.value })}
                            required
                          >
                            <option value="">Seleccionar categoría...</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="form-field">
                          <span>Marca</span>
                          <input
                            type="text"
                            value={pubForm.brand}
                            onChange={(e) => setPubForm({ ...pubForm, brand: e.target.value })}
                            placeholder="Ej: Asus, Corsair..."
                          />
                        </label>

                        <label className="form-field">
                          <span>SKU</span>
                          <input
                            type="text"
                            value={pubForm.sku}
                            onChange={(e) => setPubForm({ ...pubForm, sku: e.target.value })}
                            placeholder="Ej: GPU-ASUS-4060"
                          />
                        </label>

                        <label className="form-field">
                          <span>Precio (ARS)</span>
                          <input
                            type="number"
                            step="0.01"
                            value={pubForm.price}
                            onChange={(e) => setPubForm({ ...pubForm, price: e.target.value })}
                            placeholder="Ej: 450000"
                          />
                        </label>

                        <label className="form-field">
                          <span>Disponibilidad</span>
                          <select
                            value={pubForm.availability_status}
                            onChange={(e) =>
                              setPubForm({ ...pubForm, availability_status: e.target.value })
                            }
                          >
                            <option value="disponible">Disponible</option>
                            <option value="sin_stock">Sin stock</option>
                            <option value="pausado">Pausado</option>
                          </select>
                        </label>

                        <label className="form-field form-field-full">
                          <span>URL de Imagen Principal</span>
                          <input
                            type="url"
                            value={pubForm.image_url}
                            onChange={(e) => setPubForm({ ...pubForm, image_url: e.target.value })}
                            placeholder="https://ejemplo.com/imagen.jpg"
                          />
                        </label>

                        <label className="form-field form-field-full">
                          <span>Descripción *</span>
                          <textarea
                            rows="3"
                            value={pubForm.description}
                            onChange={(e) => setPubForm({ ...pubForm, description: e.target.value })}
                            placeholder="Especificaciones técnicas del producto..."
                            required
                          />
                        </label>

                        <div className="form-checkboxes-row">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={pubForm.is_price_visible}
                              onChange={(e) => setPubForm({ ...pubForm, is_price_visible: e.target.checked })}
                            />
                            <span>Mostrar precio públicamente</span>
                          </label>

                          {editingPubId ? (
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={pubForm.is_active}
                                onChange={(e) => setPubForm({ ...pubForm, is_active: e.target.checked })}
                              />
                              <span>Producto activo en catálogo</span>
                            </label>
                          ) : null}
                        </div>

                      </div>

                      <div className="form-actions-bar">
                        <button className="btn btn-primary" type="submit" disabled={pubSubmitting}>
                          {pubSubmitting ? "Guardando..." : editingPubId ? "Guardar Cambios" : "Crear Producto"}
                        </button>
                        <button className="btn btn-ghost" type="button" onClick={handleCancelPubForm}>
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </article>
                ) : null}

                {/* TABLA DE PRODUCTOS */}
                {publications.length === 0 ? (
                  <p>No hay publicaciones registradas.</p>
                ) : (
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Imagen</th>
                          <th>Nombre</th>
                          <th>Categoría</th>
                          <th>Precio</th>
                          <th>Stock</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {publications.map((pub) => {
                          const cover = pub.publication_images?.find((img) => img.is_cover)?.image_url
                            || pub.publication_images?.[0]?.image_url;

                          return (
                            <tr key={pub.id} style={{ opacity: pub.is_active ? 1 : 0.5 }}>
                              <td>
                                {cover ? (
                                  <img src={cover} alt={pub.name} className="admin-table-thumb" />
                                ) : (
                                  <span style={{ fontSize: "0.75rem", color: "#999" }}>Sin foto</span>
                                )}
                              </td>
                              <td>
                                <strong>{pub.name}</strong>
                                {pub.brand ? <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{pub.brand}</div> : null}
                              </td>
                              <td>{pub.categories?.name || "Sin categoría"}</td>
                              <td>{pub.is_price_visible ? formatPrice(pub.price) : "Oculto"}</td>
                              <td>
                                <span className={`status-badge status-${pub.availability_status}`}>
                                  {pub.availability_status}
                                </span>
                              </td>
                              <td>
                                <small>{pub.is_active ? "Activo" : "Inactivo"}</small>
                              </td>
                              <td>
                                <div className="admin-actions">
                                  <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => handleOpenEditPub(pub)}
                                  >
                                    Editar
                                  </button>
                                  {pub.is_active ? (
                                    <button
                                      className="btn btn-danger btn-sm"
                                      onClick={() => handleDeletePublication(pub.id)}
                                    >
                                      Eliminar
                                    </button>
                                  ) : null}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : null}

            {/* TAB 2: CONSULTAS CON CAMBIO DE ESTADO */}
            {activeTab === "inquiries" ? (
              <div className="admin-tab-content">
                <h3>Consultas Recibidas</h3>
                {inquiryFeedback ? <p className="form-feedback form-feedback-success">{inquiryFeedback}</p> : null}
                {inquiries.length === 0 ? <p>No hay consultas registradas.</p> : null}

                <div className="inquiries-grid">
                  {inquiries.map((inquiry) => (
                    <article key={inquiry.id} className="admin-inquiry-card">
                      <div className="admin-inquiry-header">
                        <div className="admin-inquiry-info">
                          <strong>{inquiry.full_name}</strong>
                          <p>{inquiry.email} {inquiry.phone ? `| Tel: ${inquiry.phone}` : ""}</p>
                        </div>

                        {/* SELECTOR DE ESTADO DE CONSULTA */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <label htmlFor={`inquiry-status-${inquiry.id}`} style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                            Estado:
                          </label>
                          <select
                            id={`inquiry-status-${inquiry.id}`}
                            className={`inquiry-status-select status-${inquiry.status}`}
                            value={inquiry.status}
                            disabled={updatingInquiryId === inquiry.id}
                            onChange={(e) => handleChangeInquiryStatus(inquiry.id, e.target.value)}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="leida">Leída</option>
                            <option value="respondida">Respondida</option>
                          </select>
                        </div>
                      </div>

                      <div className="admin-inquiry-body">
                        <p><strong>Asunto:</strong> {inquiry.subject}</p>
                        <p>{inquiry.message}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* TARJETA LATERAL (DERECHA): REGISTRAR ADMINISTRADOR */}
          <aside className="admin-side-card">
            <h3>Registrar Admin</h3>
            <p>Crear un nuevo usuario con permisos de administración.</p>

            <form onSubmit={handleCreateAdmin}>
              <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
                <label className="form-field">
                  <span>Nombre *</span>
                  <input
                    type="text"
                    value={newAdmin.firstName}
                    onChange={(e) =>
                      setNewAdmin((prev) => ({ ...prev, firstName: e.target.value }))
                    }
                    placeholder="Nombre"
                    required
                  />
                </label>

                <label className="form-field">
                  <span>Apellido *</span>
                  <input
                    type="text"
                    value={newAdmin.lastName}
                    onChange={(e) =>
                      setNewAdmin((prev) => ({ ...prev, lastName: e.target.value }))
                    }
                    placeholder="Apellido"
                    required
                  />
                </label>

                <label className="form-field">
                  <span>Email *</span>
                  <input
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) =>
                      setNewAdmin((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="admin@ejemplo.com"
                    required
                  />
                </label>

                <label className="form-field">
                  <span>Teléfono</span>
                  <input
                    type="tel"
                    value={newAdmin.phone}
                    onChange={(e) =>
                      setNewAdmin((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="Opcional"
                  />
                </label>

                <label className="form-field">
                  <span>Contraseña temporal *</span>
                  <input
                    type="password"
                    value={newAdmin.password}
                    onChange={(e) =>
                      setNewAdmin((prev) => ({ ...prev, password: e.target.value }))
                    }
                    placeholder="••••••••"
                    required
                  />
                </label>
              </div>

              {createFeedback ? (
                <p className={`form-feedback form-feedback-${createFeedbackType}`} style={{ marginTop: "0.8rem" }}>
                  {createFeedback}
                </p>
              ) : null}

              <button className="btn btn-primary" type="submit" disabled={createLoading} style={{ width: "100%", marginTop: "1.2rem" }}>
                {createLoading ? "Creando..." : "Crear administrador"}
              </button>
            </form>
          </aside>
        </div>
      ) : null}
    </section>
  );
}
