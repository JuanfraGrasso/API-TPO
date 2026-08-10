const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

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
      "La API devolvio HTML en lugar de JSON. Verifica que el backend este desplegado y que /api/inquiries exista en Render."
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
