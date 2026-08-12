const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const ADMIN_SESSION_KEY = "hardpoint-admin-session";

async function readApiResponse(response, fallbackMessage) {
  const rawText = await response.text();
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = rawText ? JSON.parse(rawText) : null;

    if (!response.ok) {
      throw new Error(data?.message || fallbackMessage);
    }

    return data;
  }

  if (!response.ok && /<!doctype|<html|cannot\s+(post|get)/i.test(rawText)) {
    throw new Error(
      "La API devolvio HTML en lugar de JSON. Verifica que el backend este desplegado correctamente en Render."
    );
  }

  if (!response.ok) {
    throw new Error(rawText || fallbackMessage);
  }

  return rawText;
}

export async function healthCheck() {
  const response = await fetch(`${API_URL}/health`);
  return readApiResponse(response, "No se pudo conectar con la API");
}

export async function getPublications() {
  const response = await fetch(`${API_URL}/publications`);
  return readApiResponse(response, "No se pudieron obtener las publicaciones");
}

export async function getAdminPublications() {
  const response = await fetch(`${API_URL}/publications?includeInactive=true`);
  return readApiResponse(response, "No se pudieron obtener las publicaciones");
}

export async function getCategories() {
  const response = await fetch(`${API_URL}/categories`);
  return readApiResponse(response, "No se pudieron obtener las categorias");
}

export async function createPublication(payload, token) {
  const response = await fetch(`${API_URL}/publications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  return readApiResponse(response, "No se pudo crear la publicacion");
}

export async function updatePublication(id, payload, token) {
  const response = await fetch(`${API_URL}/publications/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  return readApiResponse(response, "No se pudo actualizar la publicacion");
}

export async function deletePublication(id, token) {
  const response = await fetch(`${API_URL}/publications/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return readApiResponse(response, "No se pudo eliminar la publicacion");
}

export async function createInquiry(payload) {
  const response = await fetch(`${API_URL}/inquiries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return readApiResponse(response, "No se pudo enviar la consulta");
}

export async function loginAdmin(payload) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return readApiResponse(response, "No se pudo iniciar sesion");
}

export async function registerAdmin(payload, token) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  return readApiResponse(response, "No se pudo registrar el administrador");
}

export async function getAdminSession(token) {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return readApiResponse(response, "No se pudo validar la sesion");
}

export async function getAdminInquiries(token) {
  const response = await fetch(`${API_URL}/inquiries`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return readApiResponse(response, "No se pudieron obtener las consultas");
}

export async function updateInquiryStatus(id, status, token) {
  const response = await fetch(`${API_URL}/inquiries/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });

  return readApiResponse(response, "No se pudo actualizar el estado de la consulta");
}


export function getStoredAdminSession() {
  return localStorage.getItem(ADMIN_SESSION_KEY);
}

export function storeAdminSession(token, admin) {
  localStorage.setItem(ADMIN_SESSION_KEY, token);
  localStorage.setItem(`${ADMIN_SESSION_KEY}-admin`, JSON.stringify(admin));
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  localStorage.removeItem(`${ADMIN_SESSION_KEY}-admin`);
}

export function getStoredAdminProfile() {
  const rawValue = localStorage.getItem(`${ADMIN_SESSION_KEY}-admin`);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}
