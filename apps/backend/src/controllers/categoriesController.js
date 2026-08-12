import { getSupabaseClient } from "../config/supabaseClient.js";

export async function listCategoriesController(req, res, next) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, description, is_active")
      .eq("is_active", true)
      .order("name", { ascending: true });

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
