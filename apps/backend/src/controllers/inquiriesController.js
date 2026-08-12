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