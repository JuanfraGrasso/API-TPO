const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function healthCheck() {
  const response = await fetch(`${API_URL}/health`);
  if (!response.ok) {
    throw new Error("No se pudo conectar con la API");
  }
  return response.json();
}
