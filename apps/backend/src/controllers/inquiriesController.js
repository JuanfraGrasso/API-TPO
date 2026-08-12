import { getSupabaseClient } from "../config/supabaseClient.js";

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

export async function createInquiryController(req, res, next) {
  try {
    const fullName = req.body.fullName?.trim() || "";
    const email = req.body.email?.trim() || "";
    const phone = req.body.phone?.trim() || null;
    const subject = req.body.subject?.trim() || "";
    const message = req.body.message?.trim() || "";

    if (!fullName || !email || !subject || !message) {
      throw badRequest("Completa nombre, email, asunto y mensaje.");
    }

    if (!email.includes("@")) {
      throw badRequest("Ingresa un email valido.");
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("inquiries")
      .insert({
        full_name: fullName,
        email,
        phone,
        subject,
        message
      })
      .select("id, created_at, status")
      .single();

    if (error) {
      throw new Error(`Supabase insert error: ${error.message}`);
    }

    res.status(201).json({
      ok: true,
      message: "Consulta enviada correctamente.",
      data
    });
  } catch (error) {
    next(error);
  }
}

export async function listInquiriesController(req, res, next) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("inquiries")
      .select("id, full_name, email, phone, subject, message, status, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Supabase query error: ${error.message}`);
    }

    res.json({
      ok: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
}

export async function updateInquiryStatusController(req, res, next) {
  try {
    const id = Number(req.params.id);
    const status = req.body.status?.trim() || "";

    if (!id || Number.isNaN(id)) {
      throw badRequest("ID de consulta invalido.");
    }

    const validStatuses = ["pendiente", "leida", "respondida"];
    if (!validStatuses.includes(status)) {
      throw badRequest("Estado invalido. Debe ser 'pendiente', 'leida' o 'respondida'.");
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("inquiries")
      .update({ status })
      .eq("id", id)
      .select("id, full_name, email, phone, subject, message, status, created_at, updated_at")
      .single();

    if (error) {
      throw new Error(`Error al actualizar el estado de la consulta: ${error.message}`);
    }

    res.json({
      ok: true,
      message: "Estado de consulta actualizado.",
      data
    });
  } catch (error) {
    next(error);
  }
}