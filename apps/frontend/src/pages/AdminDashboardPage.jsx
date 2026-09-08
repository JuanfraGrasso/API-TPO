import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  changeAdminPassword,
  clearAdminSession,
  createCategory,
  createPublication,
  deleteCategory,
  deleteInquiry,
  deletePublication,
  getAdminInquiries,
  getAdminPublications,
  getAdminSession,
  getAdmins,
  getCategories,
  getCommerceProfile,
  getStoredAdminProfile,
  getStoredAdminSession,
  registerAdmin,
  resetAdminPassword,
  storeAdminSession,
  updateAdminProfile,
  updateInquiryStatus,
  updateCategory,
  updateCommerceProfile,
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

const initialCommerceProfile = {
  business_name: "",
  address: "",
  phone: "",
  instagram_url: "",
  facebook_url: "",
  website_url: "",
  business_hours: ""
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(getStoredAdminProfile());
  const [activeTab, setActiveTab] = useState("publications");
  const [isTabsMenuOpen, setIsTabsMenuOpen] = useState(false);

  const [publications, setPublications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [commerceProfile, setCommerceProfile] = useState(initialCommerceProfile);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState("");
  const [profileFeedbackType, setProfileFeedbackType] = useState("info");

  const [showPubForm, setShowPubForm] = useState(false);
  const [editingPubId, setEditingPubId] = useState(null);
  const [pubForm, setPubForm] = useState(initialPubForm);
  const [pubSubmitting, setPubSubmitting] = useState(false);
  const [pubFeedback, setPubFeedback] = useState("");
  const [pubFeedbackType, setPubFeedbackType] = useState("info");

  const [uploadingImages, setUploadingImages] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [imageUploadFeedback, setImageUploadFeedback] = useState("");

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [categoryFeedback, setCategoryFeedback] = useState("");
  const [categoryFeedbackType, setCategoryFeedbackType] = useState("info");

  const [updatingInquiryId, setUpdatingInquiryId] = useState(null);
  const [inquiryFeedback, setInquiryFeedback] = useState("");

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
  const [adminsList, setAdminsList] = useState([]);
  const [adminProfileForm, setAdminProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  });
  const [adminProfileSaving, setAdminProfileSaving] = useState(false);
  const [adminProfileFeedback, setAdminProfileFeedback] = useState("");
  const [adminProfileFeedbackType, setAdminProfileFeedbackType] = useState("info");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState("");
  const [passwordFeedbackType, setPasswordFeedbackType] = useState("info");
  const [resetTargetId, setResetTargetId] = useState(null);
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [resetSaving, setResetSaving] = useState(false);
  const [resetFeedback, setResetFeedback] = useState("");
  const [resetFeedbackType, setResetFeedbackType] = useState("info");

  const isLocalAdmin = !admin?.id || admin.id === "local-admin";

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

        const [inquiryRes, pubRes, catRes, profileRes] = await Promise.allSettled([
          getAdminInquiries(token),
          getAdminPublications(),
          getCategories(),
          getCommerceProfile(token)
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
        if (profileRes.status === "fulfilled" && profileRes.value.data) {
          setCommerceProfile({
            ...initialCommerceProfile,
            ...profileRes.value.data
          });
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

  useEffect(() => {
    if (!admin) return;
    setAdminProfileForm({
      firstName: admin.firstName || "",
      lastName: admin.lastName || "",
      email: admin.email || "",
      phone: admin.phone || ""
    });
  }, [admin]);

  useEffect(() => {
    if (activeTab !== "admins") return;
    const token = getStoredAdminSession();
    if (!token) return;

    let active = true;

    getAdmins(token)
      .then((result) => {
        if (active) setAdminsList(result.data || []);
      })
      .catch(() => {
        if (active) setAdminsList([]);
      });

    return () => {
      active = false;
    };
  }, [activeTab]);

  function handleLogout() {
    clearAdminSession();
    navigate("/admin/login", { replace: true });
  }

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

  function handleOpenCreateCategory() {
    setEditingCategoryId(null);
    setCategoryForm({ name: "", description: "" });
    setCategoryFeedback("");
    setShowCategoryForm(true);
  }

  function handleCancelCategoryForm() {
    setShowCategoryForm(false);
    setEditingCategoryId(null);
    setCategoryForm({ name: "", description: "" });
    setCategoryFeedback("");
  }

  async function handleSaveCategory(event) {
    event.preventDefault();
    const token = getStoredAdminSession();

    if (!token || categorySubmitting) return;

    if (!categoryForm.name.trim()) {
      setCategoryFeedbackType("error");
      setCategoryFeedback("El nombre de la categoria es obligatorio.");
      return;
    }

    try {
      setCategorySubmitting(true);
      setCategoryFeedback("");

      const payload = {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim() || null
      };
      const response = editingCategoryId
        ? await updateCategory(editingCategoryId, payload, token)
        : await createCategory(payload, token);

      setCategories((prev) => {
        const next = editingCategoryId
          ? prev.map((category) => category.id === editingCategoryId ? response.data : category)
          : [...prev, response.data];
        return next.sort((a, b) => a.name.localeCompare(b.name, "es"));
      });
      if (!editingCategoryId) {
        setPubForm((prev) => ({ ...prev, category_id: response.data.id }));
      }
      setShowCategoryForm(false);
      setEditingCategoryId(null);
      setCategoryForm({ name: "", description: "" });
    } catch (err) {
      setCategoryFeedbackType("error");
      setCategoryFeedback(err.message || "No se pudo guardar la categoria.");
    } finally {
      setCategorySubmitting(false);
    }
  }

  function handleOpenEditCategory(category) {
    setEditingCategoryId(category.id);
    setCategoryForm({
      name: category.name || "",
      description: category.description || ""
    });
    setCategoryFeedback("");
    setShowCategoryForm(true);
  }

  async function handleDeleteCategory(category) {
    const token = getStoredAdminSession();
    if (!token || !window.confirm(`¿Seguro que deseas eliminar la categoria "${category.name}"?`)) return;

    try {
      await deleteCategory(category.id, token);
      setCategories((prev) => prev.filter((item) => item.id !== category.id));
    } catch (err) {
      setCategoryFeedbackType("error");
      setCategoryFeedback(err.message || "No se pudo eliminar la categoria.");
    }
  }

  async function handleDeleteInquiry(id) {
    const token = getStoredAdminSession();
    if (!token || !window.confirm("¿Seguro que deseas eliminar esta consulta?")) return;

    try {
      await deleteInquiry(id, token);
      setInquiries((prev) => prev.filter((inquiry) => inquiry.id !== id));
      setInquiryFeedback("Consulta eliminada correctamente.");
    } catch (err) {
      setInquiryFeedback(err.message || "No se pudo eliminar la consulta.");
    }
  }

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
      getAdmins(token)
        .then((result) => setAdminsList(result.data || []))
        .catch(() => {});
    } catch (requestError) {
      setCreateFeedbackType("error");
      setCreateFeedback(requestError.message || "No se pudo crear el administrador.");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleSaveAdminProfile(event) {
    event.preventDefault();
    const token = getStoredAdminSession();

    if (!token || adminProfileSaving) return;

    if (!adminProfileForm.firstName.trim() || !adminProfileForm.lastName.trim() || !adminProfileForm.email.trim()) {
      setAdminProfileFeedbackType("error");
      setAdminProfileFeedback("Completa nombre, apellido y email.");
      return;
    }

    try {
      setAdminProfileSaving(true);
      setAdminProfileFeedback("");

      const response = await updateAdminProfile(
        {
          firstName: adminProfileForm.firstName.trim(),
          lastName: adminProfileForm.lastName.trim(),
          email: adminProfileForm.email.trim(),
          phone: adminProfileForm.phone.trim() || null
        },
        token
      );

      storeAdminSession(response.token, response.admin);
      setAdmin(response.admin);
      setAdminProfileFeedbackType("success");
      setAdminProfileFeedback(response.message || "Datos personales actualizados correctamente.");
    } catch (requestError) {
      setAdminProfileFeedbackType("error");
      setAdminProfileFeedback(requestError.message || "No se pudieron actualizar los datos.");
    } finally {
      setAdminProfileSaving(false);
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    const token = getStoredAdminSession();

    if (!token || passwordSaving) return;

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordFeedbackType("error");
      setPasswordFeedback("Completa la contraseña actual y la nueva contraseña.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordFeedbackType("error");
      setPasswordFeedback("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedbackType("error");
      setPasswordFeedback("La confirmación no coincide con la nueva contraseña.");
      return;
    }

    try {
      setPasswordSaving(true);
      setPasswordFeedback("");

      const response = await changeAdminPassword(
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        },
        token
      );

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordFeedbackType("success");
      setPasswordFeedback(response.message || "Contraseña actualizada correctamente.");
    } catch (requestError) {
      setPasswordFeedbackType("error");
      setPasswordFeedback(requestError.message || "No se pudo cambiar la contraseña.");
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleResetAdminPassword(targetId) {
    const token = getStoredAdminSession();

    if (!token || resetSaving) return;

    if (!resetPasswordValue || resetPasswordValue.length < 6) {
      setResetFeedbackType("error");
      setResetFeedback("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setResetSaving(true);
      setResetFeedback("");

      const response = await resetAdminPassword(targetId, resetPasswordValue, token);

      setResetTargetId(null);
      setResetPasswordValue("");
      setResetFeedbackType("success");
      setResetFeedback(response.message || "Contraseña restablecida correctamente.");
    } catch (requestError) {
      setResetFeedbackType("error");
      setResetFeedback(requestError.message || "No se pudo restablecer la contraseña.");
    } finally {
      setResetSaving(false);
    }
  }

  async function handleSaveCommerceProfile(event) {
    event.preventDefault();
    const token = getStoredAdminSession();

    if (!token || profileSubmitting) return;

    if (!commerceProfile.business_name.trim()) {
      setProfileFeedbackType("error");
      setProfileFeedback("Completa el nombre del comercio.");
      return;
    }

    try {
      setProfileSubmitting(true);
      setProfileFeedback("");

      const response = await updateCommerceProfile(
        {
          ...commerceProfile,
          business_name: commerceProfile.business_name.trim()
        },
        token
      );

      setCommerceProfile({ ...initialCommerceProfile, ...response.data });
      setProfileFeedbackType("success");
      setProfileFeedback("Perfil institucional actualizado correctamente.");
    } catch (requestError) {
      setProfileFeedbackType("error");
      setProfileFeedback(requestError.message || "No se pudo guardar el perfil institucional.");
    } finally {
      setProfileSubmitting(false);
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

  const adminTabs = [
    { key: "publications", label: `Productos (${publications.length})` },
    { key: "categories", label: `Categorías (${categories.length})` },
    { key: "inquiries", label: `Consultas (${inquiries.length})` },
    { key: "admins", label: "Administradores" },
    { key: "commerce", label: "Comercio" }
  ];

  return (
    <section className="admin-page-wide">
      {loading ? <p>Cargando panel...</p> : null}
      {error ? <p className="form-feedback form-feedback-error">{error}</p> : null}

      {!loading ? (
        <div className="admin-dashboard-layout">
          <div className="card admin-main-card">
            <div className="admin-dashboard-header">
              <div>
                <h2>Panel Administrador</h2>
                <p>
                </p>
              </div>

              <button className="btn btn-ghost" type="button" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>

            <div className="admin-tabs admin-tabs-desktop">
              {adminTabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`admin-tab-btn ${activeTab === tab.key ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="admin-tabs-mobile">
              <button
                type="button"
                className="admin-tabs-mobile-trigger"
                aria-expanded={isTabsMenuOpen}
                onClick={() => setIsTabsMenuOpen((prev) => !prev)}
              >
                <span>{adminTabs.find((tab) => tab.key === activeTab)?.label}</span>
                <svg
                  className={`admin-tabs-mobile-icon ${isTabsMenuOpen ? "open" : ""}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isTabsMenuOpen ? (
                <div className="admin-tabs-mobile-menu">
                  {adminTabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      className={`admin-tabs-mobile-option ${activeTab === tab.key ? "active" : ""}`}
                      onClick={() => {
                        setActiveTab(tab.key);
                        setIsTabsMenuOpen(false);
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {pubFeedback ? (
              <p className={`form-feedback form-feedback-${pubFeedbackType}`}>{pubFeedback}</p>
            ) : null}

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

                {showPubForm ? createPortal(
                  <div className="modal-overlay" onClick={handleCancelPubForm}>
                  <article className="publication-form-card modal-content" onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="modal-close-btn" onClick={handleCancelPubForm} aria-label="Cerrar">✕</button>
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

                          {imageUploadFeedback ? (
                            <p className="form-feedback form-feedback-info" style={{ marginTop: "0.5rem" }}>
                              {imageUploadFeedback}
                            </p>
                          ) : null}

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
                  </div>,
                  document.body
                ) : null}

                {publications.length === 0 ? (
                  <p>No hay publicaciones registradas.</p>
                ) : (
                  <div className="catalog-grid admin-products-grid">
                    {publications.map((pub) => {
                      const cover = pub.publication_images?.find((img) => img.is_cover)?.image_url
                        || pub.publication_images?.[0]?.image_url;

                      return (
                        <article
                          key={pub.id}
                          className={`card publication-card admin-product-card ${!pub.is_active ? "is-inactive" : ""}`}
                        >
                          <div className="publication-media">
                            {cover ? (
                              <img src={cover} alt={pub.name} className="publication-image" />
                            ) : (
                              <div className="publication-image-placeholder">Sin imagen</div>
                            )}
                          </div>
                          <div className="publication-body">
                            <h3>{pub.name}</h3>
                            <div className="publication-tags">
                              {pub.brand ? <span>Marca: {pub.brand}</span> : null}
                              <span>{pub.categories?.name || "Sin categoría"}</span>
                            </div>
                            <div className="publication-meta">
                              <strong>{pub.is_price_visible ? formatPrice(pub.price) : "Precio oculto"}</strong>
                              <span className={`status-badge status-${pub.availability_status}`}>
                                {pub.availability_status}
                              </span>
                            </div>
                            <div className="admin-product-footer">
                              <small>{pub.is_active ? "Activo" : "Inactivo"}</small>
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
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}

            {activeTab === "categories" ? (
              <div className="admin-tab-content admin-categories-tab">
                <div className="admin-section-header">
                  <div>
                    <h3>Categorías</h3>
                    <p>Organizá los productos del catálogo por categoría.</p>
                  </div>
                  <button className="btn btn-primary" type="button" onClick={handleOpenCreateCategory}>
                    + Nueva categoría
                  </button>
                </div>

                {categoryFeedback ? (
                  <p className={`form-feedback form-feedback-${categoryFeedbackType}`}>{categoryFeedback}</p>
                ) : null}

                {categories.length === 0 ? (
                  <p>No hay categorías registradas.</p>
                ) : (
                  <div className="category-management-list">
                    {categories.map((category) => (
                      <article className="category-management-item" key={category.id}>
                        <div>
                          <strong>{category.name}</strong>
                          {category.description ? <p>{category.description}</p> : null}
                        </div>
                        <div className="admin-actions">
                          <button
                            className="btn btn-ghost btn-sm"
                            type="button"
                            onClick={() => handleOpenEditCategory(category)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            type="button"
                            onClick={() => handleDeleteCategory(category)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {showCategoryForm ? createPortal(
              <div className="modal-overlay" onClick={handleCancelCategoryForm}>
                <article className="publication-form-card modal-content modal-content-sm" onClick={(e) => e.stopPropagation()}>
                  <button type="button" className="modal-close-btn" onClick={handleCancelCategoryForm} aria-label="Cerrar">✕</button>
                  <h4>{editingCategoryId ? "Editar Categoría" : "Nueva Categoría"}</h4>
                  <form onSubmit={handleSaveCategory}>
                    <div className="form-grid">
                      <label className="form-field form-field-full">
                        <span>Nombre *</span>
                        <input
                          type="text"
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                          placeholder="Ej: Placas de video"
                          required
                        />
                      </label>
                      <label className="form-field form-field-full">
                        <span>Descripción</span>
                        <textarea
                          rows="2"
                          value={categoryForm.description}
                          onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                          placeholder="Descripción opcional de la categoría"
                        />
                      </label>
                    </div>

                    {categoryFeedback ? (
                      <p className={`form-feedback form-feedback-${categoryFeedbackType}`}>{categoryFeedback}</p>
                    ) : null}

                    <div className="form-actions-bar">
                      <button className="btn btn-primary" type="submit" disabled={categorySubmitting}>
                        {categorySubmitting
                          ? "Guardando..."
                          : editingCategoryId
                            ? "Guardar cambios"
                            : "Crear Categoría"}
                      </button>
                      <button className="btn btn-ghost" type="button" onClick={handleCancelCategoryForm}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                </article>
              </div>,
              document.body
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
                        <button
                          className="btn btn-danger btn-sm"
                          type="button"
                          onClick={() => handleDeleteInquiry(inquiry.id)}
                        >
                          Eliminar consulta
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            {activeTab === "admins" ? (
              <div className="admin-tab-content admin-admins-tab">
                <h3>Mis datos personales</h3>

                {isLocalAdmin ? (
                  <p className="form-feedback form-feedback-info">
                    Iniciaste sesión con el administrador local definido por variables de entorno. Para editar tus datos o tu contraseña, usa un administrador registrado en la base de datos.
                  </p>
                ) : (
                  <>
                    <form className="admin-create-form" onSubmit={handleSaveAdminProfile}>
                      <div className="form-grid">
                        <label className="form-field">
                          <span>Nombre *</span>
                          <input
                            type="text"
                            value={adminProfileForm.firstName}
                            onChange={(e) =>
                              setAdminProfileForm((prev) => ({ ...prev, firstName: e.target.value }))
                            }
                            required
                          />
                        </label>

                        <label className="form-field">
                          <span>Apellido *</span>
                          <input
                            type="text"
                            value={adminProfileForm.lastName}
                            onChange={(e) =>
                              setAdminProfileForm((prev) => ({ ...prev, lastName: e.target.value }))
                            }
                            required
                          />
                        </label>

                        <label className="form-field">
                          <span>Email *</span>
                          <input
                            type="email"
                            value={adminProfileForm.email}
                            onChange={(e) =>
                              setAdminProfileForm((prev) => ({ ...prev, email: e.target.value }))
                            }
                            required
                          />
                        </label>

                        <label className="form-field">
                          <span>Teléfono</span>
                          <input
                            type="tel"
                            value={adminProfileForm.phone}
                            onChange={(e) =>
                              setAdminProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                            }
                            placeholder="Opcional"
                          />
                        </label>
                      </div>

                      {adminProfileFeedback ? (
                        <p className={`form-feedback form-feedback-${adminProfileFeedbackType}`}>
                          {adminProfileFeedback}
                        </p>
                      ) : null}

                      <button className="btn btn-primary" type="submit" disabled={adminProfileSaving}>
                        {adminProfileSaving ? "Guardando..." : "Guardar mis datos"}
                      </button>
                    </form>

                    <h3 className="admin-section-subtitle">Cambiar mi contraseña</h3>

                    <form className="admin-create-form" onSubmit={handleChangePassword}>
                      <div className="form-grid">
                        <label className="form-field form-field-full">
                          <span>Contraseña actual *</span>
                          <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                            }
                            placeholder="••••••••"
                            required
                          />
                        </label>

                        <label className="form-field">
                          <span>Nueva contraseña *</span>
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                            }
                            placeholder="Mínimo 6 caracteres"
                            required
                          />
                        </label>

                        <label className="form-field">
                          <span>Confirmar nueva contraseña *</span>
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                            }
                            placeholder="Repite la nueva contraseña"
                            required
                          />
                        </label>
                      </div>

                      {passwordFeedback ? (
                        <p className={`form-feedback form-feedback-${passwordFeedbackType}`}>
                          {passwordFeedback}
                        </p>
                      ) : null}

                      <button className="btn btn-primary" type="submit" disabled={passwordSaving}>
                        {passwordSaving ? "Actualizando..." : "Actualizar contraseña"}
                      </button>
                    </form>
                  </>
                )}

                <h3 className="admin-section-subtitle">Administradores registrados</h3>

                {adminsList.length === 0 ? (
                  <p className="form-feedback form-feedback-info">No hay administradores registrados en la base de datos.</p>
                ) : (
                  <div className="category-management-list">
                    {adminsList.map((item) => (
                      <article className="category-management-item" key={item.id}>
                        <div>
                          <strong>
                            {item.first_name} {item.last_name}
                            {admin?.id === item.id ? " (vos)" : ""}
                          </strong>
                          <p>
                            {item.email}
                            {item.phone ? ` · ${item.phone}` : ""}
                          </p>
                        </div>
                        <div className="admin-actions">
                          {resetTargetId === item.id ? (
                            <div className="image-url-add-row">
                              <input
                                type="password"
                                value={resetPasswordValue}
                                onChange={(e) => setResetPasswordValue(e.target.value)}
                                placeholder="Nueva contraseña"
                              />
                              <button
                                className="btn btn-primary btn-sm"
                                type="button"
                                disabled={resetSaving}
                                onClick={() => handleResetAdminPassword(item.id)}
                              >
                                {resetSaving ? "Guardando..." : "Guardar"}
                              </button>
                              <button
                                className="btn btn-ghost btn-sm"
                                type="button"
                                onClick={() => {
                                  setResetTargetId(null);
                                  setResetPasswordValue("");
                                }}
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn btn-ghost btn-sm"
                              type="button"
                              onClick={() => {
                                setResetTargetId(item.id);
                                setResetPasswordValue("");
                                setResetFeedback("");
                              }}
                            >
                              Restablecer contraseña
                            </button>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                {resetFeedback ? (
                  <p className={`form-feedback form-feedback-${resetFeedbackType}`}>{resetFeedback}</p>
                ) : null}

                <h3 className="admin-section-subtitle">Registrar administrador</h3>

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

            {activeTab === "commerce" ? (
              <div className="admin-tab-content admin-commerce-tab">
                    <h3>Información institucional</h3>


                <form className="commerce-profile-form" onSubmit={handleSaveCommerceProfile}>
                  <div className="form-grid">
                    <label className="form-field form-field-full">
                      <span>Nombre del comercio *</span>
                      <input
                        type="text"
                        value={commerceProfile.business_name}
                        onChange={(event) =>
                          setCommerceProfile((current) => ({ ...current, business_name: event.target.value }))
                        }
                        placeholder="Ej: HardPoint Computación"
                        maxLength="150"
                        required
                      />
                    </label>

                    <label className="form-field">
                      <span>Dirección</span>
                      <input
                        type="text"
                        value={commerceProfile.address}
                        onChange={(event) =>
                          setCommerceProfile((current) => ({ ...current, address: event.target.value }))
                        }
                        placeholder="Dirección del local"
                        maxLength="200"
                      />
                    </label>

                    <label className="form-field">
                      <span>Teléfono</span>
                      <input
                        type="tel"
                        value={commerceProfile.phone}
                        onChange={(event) =>
                          setCommerceProfile((current) => ({ ...current, phone: event.target.value }))
                        }
                        placeholder="+54 11 ..."
                        maxLength="40"
                      />
                    </label>

                    <label className="form-field">
                      <span>Instagram</span>
                      <input
                        type="url"
                        value={commerceProfile.instagram_url}
                        onChange={(event) =>
                          setCommerceProfile((current) => ({ ...current, instagram_url: event.target.value }))
                        }
                        placeholder="https://instagram.com/..."
                      />
                    </label>

                    <label className="form-field">
                      <span>Facebook</span>
                      <input
                        type="url"
                        value={commerceProfile.facebook_url}
                        onChange={(event) =>
                          setCommerceProfile((current) => ({ ...current, facebook_url: event.target.value }))
                        }
                        placeholder="https://facebook.com/..."
                      />
                    </label>

                    <label className="form-field">
                      <span>Sitio web</span>
                      <input
                        type="url"
                        value={commerceProfile.website_url}
                        onChange={(event) =>
                          setCommerceProfile((current) => ({ ...current, website_url: event.target.value }))
                        }
                        placeholder="https://..."
                      />
                    </label>

                    <label className="form-field">
                      <span>Horarios de atención</span>
                      <input
                        type="text"
                        value={commerceProfile.business_hours}
                        onChange={(event) =>
                          setCommerceProfile((current) => ({ ...current, business_hours: event.target.value }))
                        }
                        placeholder="Lun a Vie 9 a 18 hs"
                      />
                    </label>
                  </div>

                  {profileFeedback ? (
                    <p className={`form-feedback form-feedback-${profileFeedbackType}`}>
                      {profileFeedback}
                    </p>
                  ) : null}

                  <div className="form-actions-bar">
                    <button className="btn btn-primary" type="submit" disabled={profileSubmitting}>
                      {profileSubmitting ? "Guardando..." : "Guardar información"}
                    </button>
                  </div>
                </form>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
