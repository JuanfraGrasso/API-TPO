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
  updatePublication,
  uploadImages
} from "../services/api";

const initialPubForm = {
  name: "",
  category_id: "",
  brand: "",
  sku: "",
  price: "",
  is_price_visible: true,
  availability_status: "disponible",
  images: [],
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

  // Image Upload states
  const [uploadingImages, setUploadingImages] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [imageUploadFeedback, setImageUploadFeedback] = useState("");

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
    setCustomImageUrl("");
    setImageUploadFeedback("");
    setPubFeedback("");
    setShowPubForm(true);
  }

  function handleOpenEditPub(pub) {
    const pubImages = (pub.publication_images || []).map((img, idx) => ({
      image_url: img.image_url,
      alt_text: img.alt_text || pub.name || "",
      is_cover: Boolean(img.is_cover || (idx === 0 && !pub.publication_images?.some((x) => x.is_cover)))
    }));

    setEditingPubId(pub.id);
    setPubForm({
      name: pub.name || "",
      category_id: pub.category_id || pub.categories?.id || "",
      brand: pub.brand || "",
      sku: pub.sku || "",
      price: pub.price != null ? String(pub.price) : "",
      is_price_visible: pub.is_price_visible ?? true,
      availability_status: pub.availability_status || "disponible",
      images: pubImages,
      description: pub.description || "",
      is_active: pub.is_active ?? true
    });
    setCustomImageUrl("");
    setImageUploadFeedback("");
    setPubFeedback("");
    setShowPubForm(true);
  }

  function handleCancelPubForm() {
    setShowPubForm(false);
    setEditingPubId(null);
    setPubForm(initialPubForm);
    setCustomImageUrl("");
    setImageUploadFeedback("");
    setPubFeedback("");
  }

  // Image Upload Handlers
  async function handleImageFilesUpload(event) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const token = getStoredAdminSession();
    if (!token) return;

    try {
      setUploadingImages(true);
      setImageUploadFeedback("");

      const result = await uploadImages(files, token);
      const uploadedList = result.data || [];

      setPubForm((prev) => {
        const existing = [...prev.images];
        const hasCover = existing.some((img) => img.is_cover);

        const newItems = uploadedList.map((item, idx) => ({
          image_url: item.url,
          alt_text: prev.name || "Imagen de producto",
          is_cover: !hasCover && idx === 0
        }));

        return {
          ...prev,
          images: [...existing, ...newItems]
        };
      });

      setImageUploadFeedback(`${uploadedList.length} imagen(es) subida(s) con éxito.`);
    } catch (err) {
      setImageUploadFeedback(err.message || "Error al subir las imágenes.");
    } finally {
      setUploadingImages(false);
      event.target.value = "";
    }
  }

  function handleAddCustomUrlImage(event) {
    event.preventDefault();
    const url = customImageUrl.trim();
    if (!url) return;

    setPubForm((prev) => {
      const existing = [...prev.images];
      const hasCover = existing.some((img) => img.is_cover);
      return {
        ...prev,
        images: [
          ...existing,
          {
            image_url: url,
            alt_text: prev.name || "Imagen de producto",
            is_cover: !hasCover
          }
        ]
      };
    });

    setCustomImageUrl("");
  }

  function handleRemoveImage(indexToRemove) {
    setPubForm((prev) => {
      const filtered = prev.images.filter((_, idx) => idx !== indexToRemove);
      if (filtered.length > 0 && !filtered.some((img) => img.is_cover)) {
        filtered[0].is_cover = true;
      }
      return {
        ...prev,
        images: filtered
      };
    });
  }

  function handleSetCoverImage(indexToCover) {
    setPubForm((prev) => ({
      ...prev,
      images: prev.images.map((img, idx) => ({
        ...img,
        is_cover: idx === indexToCover
      }))
    }));
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
        images: pubForm.images,
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
              <button
                className={`admin-tab-btn ${activeTab === "admins" ? "active" : ""}`}
                onClick={() => setActiveTab("admins")}
              >
                Administradores
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

                        {/* GESTOR DE IMAGENES CON SUPABASE STORAGE */}
                        <div className="form-field form-field-full image-manager-section">
                          <div className="image-manager-header">
                            <div>
                              <span className="image-manager-title">Galería de Imágenes</span>
                              <p className="image-manager-subtitle">
                                Sube imágenes desde tu computadora a Supabase Storage o agrega URLs directas.
                              </p>
                            </div>
                            <span className="image-count-badge">
                              {pubForm.images.length} {pubForm.images.length === 1 ? "imagen" : "imágenes"}
                            </span>
                          </div>

                          {/* DROPZONE / FILE INPUT */}
                          <div className="image-upload-zone">
                            <label className={`image-upload-dropzone ${uploadingImages ? "uploading" : ""}`}>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageFilesUpload}
                                disabled={uploadingImages}
                                style={{ display: "none" }}
                              />
                              <div className="image-upload-dropzone-content">
                                <svg
                                  width="30"
                                  height="30"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="17 8 12 3 7 8" />
                                  <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                                <strong>
                                  {uploadingImages
                                    ? "Subiendo archivos a Supabase Storage..."
                                    : "Haz clic aquí para seleccionar imágenes de tu PC"}
                                </strong>
                                <small>Formatos admitidos: JPG, PNG, WEBP, GIF (máx. 10MB por archivo)</small>
                              </div>
                            </label>
                          </div>

                          {/* FEEDBACK DE SUBIDA */}
                          {imageUploadFeedback ? (
                            <p className="form-feedback form-feedback-info" style={{ marginTop: "0.5rem" }}>
                              {imageUploadFeedback}
                            </p>
                          ) : null}

                          {/* OPCION SECUNDARIA: AGREGAR URL MANUAL */}
                          <div className="image-url-add-row">
                            <input
                              type="url"
                              value={customImageUrl}
                              onChange={(e) => setCustomImageUrl(e.target.value)}
                              placeholder="O pega una URL externa (https://...)"
                            />
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={handleAddCustomUrlImage}
                              disabled={!customImageUrl.trim()}
                            >
                              + Agregar URL
                            </button>
                          </div>

                          {/* LISTA / GRILLA DE IMAGENES CARGADAS */}
                          {pubForm.images.length > 0 ? (
                            <div className="images-preview-grid">
                              {pubForm.images.map((img, index) => (
                                <div
                                  key={`${img.image_url}-${index}`}
                                  className={`image-preview-card ${img.is_cover ? "is-cover" : ""}`}
                                >
                                  <div className="image-preview-thumb-wrap">
                                    <img src={img.image_url} alt={`Preview ${index + 1}`} />
                                    {img.is_cover ? (
                                      <span className="cover-badge">★ Portada</span>
                                    ) : null}
                                  </div>

                                  <div className="image-preview-card-actions">
                                    {!img.is_cover ? (
                                      <button
                                        type="button"
                                        className="btn-set-cover"
                                        onClick={() => handleSetCoverImage(index)}
                                        title="Establecer como imagen de portada"
                                      >
                                        Hacer Portada
                                      </button>
                                    ) : (
                                      <span className="cover-text-label">Principal</span>
                                    )}

                                    <button
                                      type="button"
                                      className="btn-remove-image"
                                      onClick={() => handleRemoveImage(index)}
                                      title="Quitar esta imagen"
                                    >
                                      ✕ Quitar
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="no-images-hint">
                              No hay imágenes agregadas aún para este producto.
                            </p>
                          )}
                        </div>

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
                              <td data-label="Imagen">
                                {cover ? (
                                  <img src={cover} alt={pub.name} className="admin-table-thumb" />
                                ) : (
                                  <span style={{ fontSize: "0.75rem", color: "#999" }}>Sin foto</span>
                                )}
                              </td>
                              <td data-label="Nombre">
                                <strong>{pub.name}</strong>
                                {pub.brand ? <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{pub.brand}</div> : null}
                              </td>
                              <td data-label="Categoría">{pub.categories?.name || "Sin categoría"}</td>
                              <td data-label="Precio">{pub.is_price_visible ? formatPrice(pub.price) : "Oculto"}</td>
                              <td data-label="Stock">
                                <span className={`status-badge status-${pub.availability_status}`}>
                                  {pub.availability_status}
                                </span>
                              </td>
                              <td data-label="Estado">
                                <small>{pub.is_active ? "Activo" : "Inactivo"}</small>
                              </td>
                              <td data-label="Acciones">
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

            {activeTab === "admins" ? (
              <div className="admin-tab-content admin-admins-tab">
                <div className="admin-section-header">
                  <div>
                    <h3>Registrar administrador</h3>
                    <p>Crear un nuevo usuario con permisos de administración.</p>
                  </div>
                </div>

                <form className="admin-create-form" onSubmit={handleCreateAdmin}>
                  <div className="form-grid">
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

                    <label className="form-field form-field-full">
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

                    <label className="form-field form-field-full">
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

                    <label className="form-field form-field-full">
                      <span>Contraseña *</span>
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
                    <p className={`form-feedback form-feedback-${createFeedbackType}`}>
                      {createFeedback}
                    </p>
                  ) : null}

                  <button className="btn btn-primary" type="submit" disabled={createLoading}>
                    {createLoading ? "Creando..." : "Crear administrador"}
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
