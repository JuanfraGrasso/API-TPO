import { getSupabaseClient } from "../config/supabaseClient.js";

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

const profileFields = "id, business_name, address, phone, instagram_url, facebook_url, website_url, business_hours";

function normalizeProfile(body) {
  return {
    business_name: body.business_name?.trim() || body.businessName?.trim() || "",
    address: body.address?.trim() || null,
    phone: body.phone?.trim() || null,
    instagram_url: body.instagram_url?.trim() || body.instagramUrl?.trim() || null,
    facebook_url: body.facebook_url?.trim() || body.facebookUrl?.trim() || null,
    website_url: body.website_url?.trim() || body.websiteUrl?.trim() || null,
    business_hours: body.business_hours?.trim() || body.businessHours?.trim() || null
  };
}

export async function getCommerceProfileController(req, res, next) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("commerce_profile")
      .select(profileFields)
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Supabase query error: ${error.message}`);
    }

    res.json({ ok: true, data: data || null });
  } catch (error) {
    next(error);
  }
}

export async function updateCommerceProfileController(req, res, next) {
  try {
    const profile = normalizeProfile(req.body);

    if (!profile.business_name) {
      throw badRequest("El nombre del comercio es obligatorio.");
    }
    const supabase = getSupabaseClient();
    const { data: existingProfile, error: lookupError } = await supabase
      .from("commerce_profile")
      .select("id")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (lookupError) {
      throw new Error(`Supabase query error: ${lookupError.message}`);
    }

    const query = existingProfile
      ? supabase.from("commerce_profile").update(profile).eq("id", existingProfile.id)
      : supabase.from("commerce_profile").insert({
        ...profile,
        description: profile.business_name
      });

    const { data, error } = await query.select(profileFields).single();

    if (error) {
      throw new Error(`Error al guardar el perfil institucional: ${error.message}`);
    }

    res.json({
      ok: true,
      message: "Perfil institucional actualizado correctamente.",
      data
    });
  } catch (error) {
    next(error);
  }
}
