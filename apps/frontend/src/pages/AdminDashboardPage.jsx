import { useEffect, useState } from "react";
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
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
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

function formatAvailabilityLabel(value) {
  const label = value?.replaceAll("_", " ") || "";
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(getStoredAdminProfile());
  const [activeTab, setActiveTab] = useState("publications");

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
    { key: "publications", label: "Productos" },
    { key: "categories", label: "Categorías" },
    { key: "inquiries", label: "Consultas" },
    { key: "admins", label: "Administradores" },
    { key: "commerce", label: "Comercio" }
  ];

  return (
    <Box component="section" className="admin-page-wide">
      {loading ? (
        <Box className="admin-loading-state">
          <CircularProgress size={22} />
          <Typography color="text.secondary">Cargando panel...</Typography>
        </Box>
      ) : null}
      {error ? <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>{error}</Alert> : null}

      {!loading ? (
        <div className="admin-dashboard-layout">
          <Paper className="admin-main-card" elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 2, p: { xs: 1.5, sm: 3 } }}>
            <Paper
              className="admin-dashboard-header"
              elevation={0}
              sx={{
                bgcolor: "primary.main",
                color: "background.paper",
                width: { xs: "calc(100% + 26px)", sm: "calc(100% + 50px)" },
                ml: { xs: "-13px", sm: "-25px" },
                mr: { xs: "-13px", sm: "-25px" },
                mt: { xs: "-13px", sm: "-25px" },
                mb: 0,
                borderRadius: "15px 15px 0 0",
                px: { xs: 1.5, sm: 2.5 },
                py: { xs: 1.5, sm: 2 }
              }}
            >
              <Typography component="h1" variant="h4" color="inherit" sx={{ fontSize: { xs: "1.5rem", sm: "1.85rem" } }}>
                Panel administrador
              </Typography>
            </Paper>

            <Tabs
              className="admin-tabs"
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="Secciones del panel administrador"
              sx={{
                display: { xs: "none", sm: "flex" },
                mt: 1.25,
                mb: 3,
                borderBottom: "1px solid var(--border-subtle)",
                "& .MuiTab-root": {
                  fontSize: "0.94rem"
                },
                "& .MuiTabs-indicator": { height: 3, borderRadius: "3px 3px 0 0" }
              }}
            >
              {adminTabs.map((tab) => (
                <Tab key={tab.key} value={tab.key} label={tab.label} />
              ))}
            </Tabs>
            <Box sx={{ display: { xs: "block", sm: "none" }, mt: 1.25, mb: 2.5 }}>
              <TextField
                select
                label="Sección del panel"
                value={activeTab}
                onChange={(event) => setActiveTab(event.target.value)}
              >
                {adminTabs.map((tab) => (
                  <MenuItem key={tab.key} value={tab.key}>{tab.label}</MenuItem>
                ))}
              </TextField>
            </Box>

            {pubFeedback ? (
              <Alert severity={pubFeedbackType} sx={{ mb: 2 }}>{pubFeedback}</Alert>
            ) : null}

            {activeTab === "publications" ? (
              <div className="admin-tab-content">
                <div className="admin-section-header">
                  <Box>
                    <Typography component="h2" variant="h5" fontWeight={800}>Productos</Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.35 }}>
                      Administrá publicaciones, imágenes, precios y disponibilidad del catálogo.
                    </Typography>
                  </Box>
                  {!showPubForm ? (
                    <Button variant="contained" onClick={handleOpenCreatePub}>Nuevo producto</Button>
                  ) : null}
                </div>

                {showPubForm ? (
                  <Dialog open onClose={handleCancelPubForm} fullWidth maxWidth="md" scroll="paper">
                    <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 1 }}>
                      {editingPubId ? "Editar producto" : "Nuevo producto"}
                      <IconButton onClick={handleCancelPubForm} aria-label="Cerrar diálogo">×</IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                    <form onSubmit={handleSavePublication}>
                      <div className="form-grid">
                        <TextField
                          label="Nombre"
                          value={pubForm.name}
                          onChange={(e) => setPubForm({ ...pubForm, name: e.target.value })}
                          placeholder="Ej: RTX 4060 Ti 8GB"
                          required
                        />

                        <TextField
                          select
                          label="Categoría"
                          value={pubForm.category_id}
                          onChange={(e) => setPubForm({ ...pubForm, category_id: e.target.value })}
                          required
                        >
                          {categories.map((cat) => (
                            <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                          ))}
                        </TextField>

                        <TextField
                          label="Marca"
                          value={pubForm.brand}
                          onChange={(e) => setPubForm({ ...pubForm, brand: e.target.value })}
                          placeholder="Ej: Asus, Corsair..."
                        />

                        <TextField
                          label="SKU"
                          value={pubForm.sku}
                          onChange={(e) => setPubForm({ ...pubForm, sku: e.target.value })}
                          placeholder="Ej: GPU-ASUS-4060"
                        />

                        <TextField
                          label="Precio (ARS)"
                          type="number"
                          inputProps={{ min: 0, step: "0.01" }}
                          value={pubForm.price}
                          onChange={(e) => setPubForm({ ...pubForm, price: e.target.value })}
                          placeholder="Ej: 450000"
                        />

                        <TextField
                          select
                          label="Disponibilidad"
                          value={pubForm.availability_status}
                          onChange={(e) => setPubForm({ ...pubForm, availability_status: e.target.value })}
                        >
                          <MenuItem value="disponible">Disponible</MenuItem>
                          <MenuItem value="sin_stock">Sin stock</MenuItem>
                          <MenuItem value="pausado">Pausado</MenuItem>
                        </TextField>

                        <div className="form-field-full image-manager-section">
                          <div className="image-manager-header">
                            <div>
                              <Typography className="image-manager-title">Galería de imágenes</Typography>
                              <Typography variant="body2" color="text.secondary" className="image-manager-subtitle">
                                Sube imágenes desde tu computadora a Supabase Storage o agrega URLs directas.
                              </Typography>
                            </div>
                            <Chip
                              className="image-count-badge"
                              label={`${pubForm.images.length} ${pubForm.images.length === 1 ? "imagen" : "imágenes"}`}
                              size="small"
                              variant="outlined"
                            />
                          </div>

                          <div className="image-upload-zone">
                            <Button
                              component="label"
                              variant="outlined"
                              className={`image-upload-dropzone ${uploadingImages ? "uploading" : ""}`}
                              disabled={uploadingImages}
                              sx={{ width: "100%", minHeight: 120, borderStyle: "dashed", textAlign: "center" }}
                            >
                              <input
                                hidden
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageFilesUpload}
                              />
                              <Stack spacing={0.5} alignItems="center">
                                <Typography fontWeight={700}>
                                  {uploadingImages
                                    ? "Subiendo archivos a Supabase Storage..."
                                    : "Haz clic aquí para seleccionar imágenes de tu PC"}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  JPG, PNG, WEBP o GIF. Máximo 10 MB por archivo.
                                </Typography>
                              </Stack>
                            </Button>
                          </div>

                          {imageUploadFeedback ? (
                            <Alert severity="info" sx={{ mt: 1 }}>
                              {imageUploadFeedback}
                            </Alert>
                          ) : null}

                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Agregar imagen por URL"
                              type="url"
                              value={customImageUrl}
                              onChange={(e) => setCustomImageUrl(e.target.value)}
                              placeholder="https://..."
                            />
                            <Button
                              variant="outlined"
                              onClick={handleAddCustomUrlImage}
                              disabled={!customImageUrl.trim()}
                              sx={{ whiteSpace: "nowrap" }}
                            >
                              Agregar URL
                            </Button>
                          </Stack>

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
                                      <Chip className="cover-badge" label="Portada" size="small" color="primary" />
                                    ) : null}
                                  </div>

                                  <div className="image-preview-card-actions">
                                    {!img.is_cover ? (
                                      <Button
                                        size="small"
                                        variant="text"
                                        onClick={() => handleSetCoverImage(index)}
                                        title="Establecer como imagen de portada"
                                      >
                                        Hacer portada
                                      </Button>
                                    ) : (
                                      <Chip className="cover-text-label" label="Principal" size="small" color="primary" />
                                    )}

                                    <Button
                                      size="small"
                                      color="error"
                                      variant="text"
                                      onClick={() => handleRemoveImage(index)}
                                      title="Quitar esta imagen"
                                    >
                                      Quitar
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <Typography className="no-images-hint" color="text.secondary">
                              No hay imágenes agregadas aún para este producto.
                            </Typography>
                          )}
                        </div>

                        <TextField
                          className="form-field-full"
                          label="Descripción"
                          multiline
                          minRows={3}
                          value={pubForm.description}
                          onChange={(e) => setPubForm({ ...pubForm, description: e.target.value })}
                          placeholder="Especificaciones técnicas del producto..."
                          required
                        />

                        <div className="form-checkboxes-row">
                          <FormControlLabel
                            control={<Switch checked={pubForm.is_price_visible} onChange={(e) => setPubForm({ ...pubForm, is_price_visible: e.target.checked })} />}
                            label="Mostrar precio públicamente"
                          />

                          {editingPubId ? (
                            <FormControlLabel
                              control={<Switch checked={pubForm.is_active} onChange={(e) => setPubForm({ ...pubForm, is_active: e.target.checked })} />}
                              label="Producto activo en catálogo"
                            />
                          ) : null}
                        </div>

                      </div>

                      <div className="form-actions-bar">
                        <Button variant="contained" type="submit" disabled={pubSubmitting}>
                          {pubSubmitting ? "Guardando..." : editingPubId ? "Guardar Cambios" : "Crear Producto"}
                        </Button>
                        <Button variant="outlined" type="button" onClick={handleCancelPubForm}>
                          Cancelar
                        </Button>
                      </div>
                    </form>
                    </DialogContent>
                  </Dialog>
                ) : null}

                {publications.length === 0 ? (
                  <Alert severity="info">No hay publicaciones registradas.</Alert>
                ) : (
                  <div className="catalog-grid admin-products-grid">
                    {publications.map((pub) => {
                      const cover = pub.publication_images?.find((img) => img.is_cover)?.image_url
                        || pub.publication_images?.[0]?.image_url;

                      return (
                        <Card
                          key={pub.id}
                          className={`card publication-card admin-product-card ${!pub.is_active ? "is-inactive" : ""}`}
                          component="article"
                          variant="outlined"
                          elevation={0}
                          sx={{
                            display: "grid",
                            minWidth: 0,
                            gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(190px, 42%) minmax(0, 1fr)" }
                          }}
                        >
                          <div className="publication-media">
                            {cover ? (
                              <img src={cover} alt={pub.name} className="publication-image" />
                            ) : (
                              <div className="publication-image-placeholder">Sin imagen</div>
                            )}
                          </div>
                          <CardContent className="publication-body" sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                            <Typography component="h3" variant="h6" fontWeight={750}>
                              {pub.name}
                            </Typography>
                            <div className="publication-tags">
                              {pub.brand ? <Chip size="small" label={pub.brand} variant="outlined" /> : null}
                              <Chip size="small" label={pub.categories?.name || "Sin categoría"} />
                            </div>
                            <div className="publication-meta">
                              <Typography component="strong" fontWeight={800}>
                                {pub.is_price_visible ? formatPrice(pub.price) : "Precio oculto"}
                              </Typography>
                              <Chip
                                size="small"
                                label={formatAvailabilityLabel(pub.availability_status)}
                                color={pub.availability_status === "disponible" ? "success" : pub.availability_status === "sin_stock" ? "error" : "warning"}
                                variant="outlined"
                              />
                            </div>
                            <div className="admin-product-footer">
                              <Chip size="small" label={pub.is_active ? "Activo" : "Inactivo"} color={pub.is_active ? "success" : "default"} />
                              <div className="admin-actions">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleOpenEditPub(pub)}
                                >
                                  Editar
                                </Button>
                                {pub.is_active ? (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    onClick={() => handleDeletePublication(pub.id)}
                                  >
                                    Eliminar
                                  </Button>
                                ) : null}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
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
                    <Typography component="h2" variant="h5" fontWeight={800}>Categorías</Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.35 }}>
                      Organizá los productos del catálogo por categoría.
                    </Typography>
                  </div>
                  <Button variant="contained" onClick={handleOpenCreateCategory}>Nueva categoría</Button>
                </div>

                {categoryFeedback ? (
                  <Alert severity={categoryFeedbackType} sx={{ mb: 2 }}>{categoryFeedback}</Alert>
                ) : null}

                {categories.length === 0 ? (
                  <Alert severity="info">No hay categorías registradas.</Alert>
                ) : (
                  <div className="category-management-list">
                    {categories.map((category) => (
                      <Paper className="category-management-item" component="article" variant="outlined" key={category.id}>
                        <div>
                          <Typography fontWeight={750}>{category.name}</Typography>
                          {category.description ? (
                            <Typography variant="body2" color="text.secondary">{category.description}</Typography>
                          ) : null}
                        </div>
                        <div className="admin-actions">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleOpenEditCategory(category)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleDeleteCategory(category)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </Paper>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {showCategoryForm ? (
              <Dialog open onClose={handleCancelCategoryForm} fullWidth maxWidth="sm">
                <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 1 }}>
                  {editingCategoryId ? "Editar categoría" : "Nueva categoría"}
                  <IconButton onClick={handleCancelCategoryForm} aria-label="Cerrar diálogo">×</IconButton>
                </DialogTitle>
                <DialogContent dividers>
                  <form onSubmit={handleSaveCategory}>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                      <TextField
                        label="Nombre"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        placeholder="Ej: Placas de video"
                        required
                      />
                      <TextField
                        label="Descripción"
                        multiline
                        minRows={2}
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        placeholder="Descripción opcional de la categoría"
                      />

                    {categoryFeedback ? (
                      <Alert severity={categoryFeedbackType}>{categoryFeedback}</Alert>
                    ) : null}

                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button variant="outlined" type="button" onClick={handleCancelCategoryForm}>
                        Cancelar
                      </Button>
                      <Button variant="contained" type="submit" disabled={categorySubmitting}>
                        {categorySubmitting
                          ? "Guardando..."
                          : editingCategoryId
                            ? "Guardar cambios"
                            : "Crear Categoría"}
                      </Button>
                    </Stack>
                    </Stack>
                  </form>
                </DialogContent>
              </Dialog>
            ) : null}

            {/* TAB 2: CONSULTAS CON CAMBIO DE ESTADO */}
            {activeTab === "inquiries" ? (
              <div className="admin-tab-content">
                <div className="admin-section-header">
                  <Box>
                    <Typography component="h2" variant="h5" fontWeight={800}>Consultas recibidas</Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.35 }}>
                      Revisá los mensajes de clientes y actualizá su estado de seguimiento.
                    </Typography>
                  </Box>
                  <Chip label={`${inquiries.length} en total`} variant="outlined" />
                </div>
                {inquiryFeedback ? <Alert severity="success" sx={{ mb: 2 }}>{inquiryFeedback}</Alert> : null}
                {inquiries.length === 0 ? <Alert severity="info">No hay consultas registradas.</Alert> : null}

                <div className="inquiries-grid">
                  {inquiries.map((inquiry) => (
                    <Paper key={inquiry.id} component="article" variant="outlined" className="admin-inquiry-card">
                      <div className="admin-inquiry-header">
                        <div className="admin-inquiry-info">
                          <Typography fontWeight={750}>{inquiry.full_name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {inquiry.email} {inquiry.phone ? `| Tel: ${inquiry.phone}` : ""}
                          </Typography>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <TextField
                            select
                            size="small"
                            label="Estado"
                            value={inquiry.status}
                            disabled={updatingInquiryId === inquiry.id}
                            onChange={(e) => handleChangeInquiryStatus(inquiry.id, e.target.value)}
                          >
                            <MenuItem value="pendiente">Pendiente</MenuItem>
                            <MenuItem value="leida">Leída</MenuItem>
                            <MenuItem value="respondida">Respondida</MenuItem>
                          </TextField>
                        </div>
                      </div>

                      <div className="admin-inquiry-body">
                        <Typography><strong>Asunto:</strong> {inquiry.subject}</Typography>
                        <Typography color="text.secondary">{inquiry.message}</Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteInquiry(inquiry.id)}
                        >
                          Eliminar consulta
                        </Button>
                      </div>
                    </Paper>
                  ))}
                </div>
              </div>
            ) : null}

            {activeTab === "admins" ? (
              <div className="admin-tab-content admin-admins-tab">
                <Box className="admin-admins-grid">
                  <Paper className="admin-management-section" variant="outlined">
                    <Typography component="h2" variant="h6" fontWeight={750}>Perfil del administrador</Typography>
                    {isLocalAdmin ? (
                      <Alert severity="info">
                        Iniciaste sesión con el administrador local definido por variables de entorno. Para editar tus datos, usa una cuenta registrada en la base de datos.
                      </Alert>
                    ) : (
                      <form className="admin-create-form" onSubmit={handleSaveAdminProfile}>
                        <div className="form-grid">
                          <TextField
                            label="Nombre"
                            value={adminProfileForm.firstName}
                            onChange={(e) => setAdminProfileForm((prev) => ({ ...prev, firstName: e.target.value }))}
                            required
                          />
                          <TextField
                            label="Apellido"
                            value={adminProfileForm.lastName}
                            onChange={(e) => setAdminProfileForm((prev) => ({ ...prev, lastName: e.target.value }))}
                            required
                          />
                          <TextField
                            label="Correo electrónico"
                            type="email"
                            value={adminProfileForm.email}
                            onChange={(e) => setAdminProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                            required
                          />
                          <TextField
                            label="Teléfono"
                            type="tel"
                            value={adminProfileForm.phone}
                            onChange={(e) => setAdminProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                            placeholder="Opcional"
                          />
                        </div>
                        {adminProfileFeedback ? <Alert severity={adminProfileFeedbackType}>{adminProfileFeedback}</Alert> : null}
                        <Button variant="contained" type="submit" disabled={adminProfileSaving}>
                          {adminProfileSaving ? "Guardando..." : "Guardar mis datos"}
                        </Button>
                      </form>
                    )}
                  </Paper>

                  <Paper className="admin-management-section" variant="outlined">
                    <Typography component="h2" variant="h6" fontWeight={750}>Seguridad de la cuenta</Typography>
                    {isLocalAdmin ? (
                      <Alert severity="info">
                        El administrador local no puede cambiar su contraseña desde el panel.
                      </Alert>
                    ) : (
                      <form className="admin-create-form" onSubmit={handleChangePassword}>
                        <div className="form-grid">
                          <TextField
                            className="form-field-full"
                            label="Contraseña actual"
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                            required
                          />
                          <TextField
                            label="Nueva contraseña"
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                            helperText="Mínimo 6 caracteres"
                            required
                          />
                          <TextField
                            label="Confirmar nueva contraseña"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                            required
                          />
                        </div>
                        {passwordFeedback ? <Alert severity={passwordFeedbackType}>{passwordFeedback}</Alert> : null}
                        <Button variant="contained" type="submit" disabled={passwordSaving}>
                          {passwordSaving ? "Actualizando..." : "Actualizar contraseña"}
                        </Button>
                      </form>
                    )}
                  </Paper>

                  <Paper className="admin-management-section" variant="outlined">
                    <Typography component="h2" variant="h6" fontWeight={750}>Administradores registrados</Typography>
                    {adminsList.length === 0 ? (
                      <Alert severity="info">No hay administradores registrados en la base de datos.</Alert>
                    ) : (
                      <Stack className="admin-admins-list">
                        {adminsList.map((item) => (
                          <Box className="admin-admin-list-row" component="article" key={item.id}>
                            <Box>
                              <Typography fontWeight={750}>
                                {item.first_name} {item.last_name}{admin?.id === item.id ? " (vos)" : ""}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {item.email}{item.phone ? ` · ${item.phone}` : ""}
                              </Typography>
                            </Box>
                            <Box className="admin-admin-list-actions">
                              {resetTargetId === item.id ? (
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center">
                                  <TextField
                                    type="password"
                                    size="small"
                                    label="Nueva contraseña"
                                    value={resetPasswordValue}
                                    onChange={(e) => setResetPasswordValue(e.target.value)}
                                  />
                                  <Button size="small" variant="contained" disabled={resetSaving} onClick={() => handleResetAdminPassword(item.id)}>
                                    {resetSaving ? "Guardando..." : "Guardar"}
                                  </Button>
                                  <Button size="small" variant="text" onClick={() => { setResetTargetId(null); setResetPasswordValue(""); }}>
                                    Cancelar
                                  </Button>
                                </Stack>
                              ) : (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => { setResetTargetId(item.id); setResetPasswordValue(""); setResetFeedback(""); }}
                                >
                                  Restablecer contraseña
                                </Button>
                              )}
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    )}
                    {resetFeedback ? <Alert severity={resetFeedbackType}>{resetFeedback}</Alert> : null}
                  </Paper>

                  <Paper className="admin-management-section" variant="outlined">
                    <Typography component="h2" variant="h6" fontWeight={750}>Registrar administrador</Typography>
                    <form className="admin-create-form" onSubmit={handleCreateAdmin}>
                      <div className="form-grid">
                        <TextField
                          label="Nombre"
                          value={newAdmin.firstName}
                          onChange={(e) => setNewAdmin((prev) => ({ ...prev, firstName: e.target.value }))}
                          required
                        />
                        <TextField
                          label="Apellido"
                          value={newAdmin.lastName}
                          onChange={(e) => setNewAdmin((prev) => ({ ...prev, lastName: e.target.value }))}
                          required
                        />
                        <TextField
                          className="form-field-full"
                          label="Correo electrónico"
                          type="email"
                          value={newAdmin.email}
                          onChange={(e) => setNewAdmin((prev) => ({ ...prev, email: e.target.value }))}
                          required
                        />
                        <TextField
                          className="form-field-full"
                          label="Teléfono"
                          type="tel"
                          value={newAdmin.phone}
                          onChange={(e) => setNewAdmin((prev) => ({ ...prev, phone: e.target.value }))}
                          placeholder="Opcional"
                        />
                        <TextField
                          className="form-field-full"
                          label="Contraseña"
                          type="password"
                          value={newAdmin.password}
                          onChange={(e) => setNewAdmin((prev) => ({ ...prev, password: e.target.value }))}
                          required
                        />
                      </div>
                      {createFeedback ? <Alert severity={createFeedbackType}>{createFeedback}</Alert> : null}
                      <Button variant="contained" type="submit" disabled={createLoading}>
                        {createLoading ? "Creando..." : "Crear administrador"}
                      </Button>
                    </form>
                  </Paper>
                </Box>
              </div>
            ) : null}

            {activeTab === "commerce" ? (
              <div className="admin-tab-content admin-commerce-tab">
                <div className="admin-section-header">
                  <div>
                    <Typography component="h2" variant="h5" fontWeight={800}>Información del comercio</Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.35 }}>
                      Estos datos se muestran en las páginas públicas de contacto e información.
                    </Typography>
                  </div>
                </div>

                <form className="commerce-profile-form" onSubmit={handleSaveCommerceProfile}>
                  <div className="form-grid">
                    <TextField
                      className="form-field-full"
                      label="Nombre del comercio"
                      value={commerceProfile.business_name}
                      onChange={(event) => setCommerceProfile((current) => ({ ...current, business_name: event.target.value }))}
                      placeholder="Ej: HardPoint Computación"
                      inputProps={{ maxLength: 150 }}
                      required
                    />
                    <TextField
                      label="Dirección"
                      value={commerceProfile.address}
                      onChange={(event) => setCommerceProfile((current) => ({ ...current, address: event.target.value }))}
                      placeholder="Dirección del local"
                      inputProps={{ maxLength: 200 }}
                    />
                    <TextField
                      label="Teléfono"
                      type="tel"
                      value={commerceProfile.phone}
                      onChange={(event) => setCommerceProfile((current) => ({ ...current, phone: event.target.value }))}
                      placeholder="+54 11 ..."
                      inputProps={{ maxLength: 40 }}
                    />
                    <TextField
                      label="Instagram"
                      type="url"
                      value={commerceProfile.instagram_url}
                      onChange={(event) => setCommerceProfile((current) => ({ ...current, instagram_url: event.target.value }))}
                      placeholder="https://instagram.com/..."
                    />
                    <TextField
                      label="Facebook"
                      type="url"
                      value={commerceProfile.facebook_url}
                      onChange={(event) => setCommerceProfile((current) => ({ ...current, facebook_url: event.target.value }))}
                      placeholder="https://facebook.com/..."
                    />
                    <TextField
                      label="Sitio web"
                      type="url"
                      value={commerceProfile.website_url}
                      onChange={(event) => setCommerceProfile((current) => ({ ...current, website_url: event.target.value }))}
                      placeholder="https://..."
                    />
                    <TextField
                      label="Horarios de atención"
                      value={commerceProfile.business_hours}
                      onChange={(event) => setCommerceProfile((current) => ({ ...current, business_hours: event.target.value }))}
                      placeholder="Lun a Vie 9 a 18 hs"
                    />
                  </div>

                  {profileFeedback ? (
                    <Alert severity={profileFeedbackType}>
                      {profileFeedback}
                    </Alert>
                  ) : null}

                  <div className="form-actions-bar">
                    <Button variant="contained" type="submit" disabled={profileSubmitting}>
                      {profileSubmitting ? "Guardando..." : "Guardar información"}
                    </Button>
                  </div>
                </form>
              </div>
            ) : null}
          </Paper>
        </div>
      ) : null}
    </Box>
  );
}
