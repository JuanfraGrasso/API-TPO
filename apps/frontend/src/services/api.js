const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function healthCheck() {
  const response = await fetch(`${API_URL}/health`);
  if (!response.ok) {
    throw new Error("No se pudo conectar con la API");
  }
  return response.json();
}

export async function getPublications() {
  const response = await fetch(`${API_URL}/publications`);
  if (!response.ok) {
    throw new Error("No se pudieron obtener las publicaciones");
  }
  return response.json();
}

export async function createInquiry(payload) {
  const response = await fetch(`${API_URL}/inquiries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "No se pudo enviar la consulta");
  }

  return result;
}
