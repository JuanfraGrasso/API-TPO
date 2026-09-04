import { getSupabaseClient } from "../config/supabaseClient.js";

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

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

export async function createCategoryController(req, res, next) {
  try {
    const name = req.body.name?.trim() || "";
    const description = req.body.description?.trim() || null;

    if (!name) {
      throw badRequest("El nombre de la categoria es obligatorio.");
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("categories")
      .insert({ name, description })
      .select("id, name, description, is_active")
      .single();

    if (error) {
      if (error.code === "23505") {
        throw badRequest("Ya existe una categoria con ese nombre.");
      }
      throw new Error(`Error al crear la categoria: ${error.message}`);
    }

    res.status(201).json({
      ok: true,
      message: "Categoria creada correctamente.",
      data
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCategoryController(req, res, next) {
  try {
    const id = Number(req.params.id);
    const name = req.body.name?.trim() || "";
    const description = req.body.description?.trim() || null;

    if (!id || Number.isNaN(id)) {
      throw badRequest("ID de categoria invalido.");
    }
    if (!name) {
      throw badRequest("El nombre de la categoria es obligatorio.");
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("categories")
      .update({ name, description })
      .eq("id", id)
      .select("id, name, description, is_active")
      .single();

    if (error) {
      if (error.code === "23505") {
        throw badRequest("Ya existe una categoria con ese nombre.");
      }
      throw new Error(`Error al actualizar la categoria: ${error.message}`);
    }

    res.json({ ok: true, message: "Categoria actualizada correctamente.", data });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategoryController(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      throw badRequest("ID de categoria invalido.");
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("categories")
      .update({ is_active: false })
      .eq("id", id)
      .select("id, name, description, is_active")
      .single();

    if (error) {
      throw new Error(`Error al eliminar la categoria: ${error.message}`);
    }

    res.json({ ok: true, message: "Categoria eliminada correctamente.", data });
  } catch (error) {
    next(error);
  }
}
