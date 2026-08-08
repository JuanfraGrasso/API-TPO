import { getSupabaseClient } from "../config/supabaseClient.js";

export async function listPublicationsController(req, res, next) {
  try {
    const supabase = getSupabaseClient();
    const search = req.query.search?.trim() || "";
    const categoryId = Number(req.query.categoryId) || null;

    let query = supabase
      .from("publications")
      .select(
        "id, name, description, price, is_price_visible, availability_status, is_active, created_at, categories(id, name), publication_images(image_url, alt_text, is_cover)"
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, error } = await query;

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
