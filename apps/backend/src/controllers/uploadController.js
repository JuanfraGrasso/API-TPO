import { getSupabaseClient } from "../config/supabaseClient.js";
import { env } from "../config/env.js";

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

export async function uploadImagesController(req, res, next) {
  try {
    const files = req.files || (req.file ? [req.file] : []);

    if (!files || files.length === 0) {
      throw badRequest("No se enviaron archivos para subir.");
    }

    const supabase = getSupabaseClient();
    const bucket = env.supabaseStorageBucket || "public-images";
    const uploadedImages = [];

    for (const file of files) {
      // Validar tipo de archivo
      if (!file.mimetype.startsWith("image/")) {
        throw badRequest(`El archivo ${file.originalname} no es una imagen valida.`);
      }

      // Nombre seguro y unico
      const cleanName = file.originalname
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9.-]/g, "_");
      const filePath = `publications/${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${cleanName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) {
        throw new Error(
          `Error al subir ${file.originalname} al almacenamiento: ${uploadError.message}`
        );
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      uploadedImages.push({
        url: urlData.publicUrl,
        filePath,
        originalName: file.originalname
      });
    }

    res.status(201).json({
      ok: true,
      message: `${uploadedImages.length} imagen(es) subida(s) correctamente.`,
      data: uploadedImages
    });
  } catch (error) {
    next(error);
  }
}
