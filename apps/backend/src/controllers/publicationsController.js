import { getSupabaseClient } from "../config/supabaseClient.js";

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

export async function listPublicationsController(req, res, next) {
  try {
    const supabase = getSupabaseClient();
    const search = req.query.search?.trim() || "";
    const categoryId = Number(req.query.categoryId) || null;
    const includeInactive = req.query.includeInactive === "true";

    let query = supabase
      .from("publications")
      .select(
        "id, name, sku, brand, category_id, description, price, is_price_visible, availability_status, is_active, created_at, categories(id, name), publication_images(id, image_url, alt_text, is_cover)"
      )
      .order("created_at", { ascending: false });

    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

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

export async function createPublicationController(req, res, next) {
  try {
    const name = req.body.name?.trim() || "";
    const categoryId = Number(req.body.category_id || req.body.categoryId) || null;
    const description = req.body.description?.trim() || "";
    const priceInput = req.body.price;
    const price = priceInput !== "" && priceInput != null ? Number(priceInput) : null;
    const isPriceVisible = req.body.is_price_visible ?? req.body.isPriceVisible ?? true;
    const availabilityStatus = req.body.availability_status || req.body.availabilityStatus || "disponible";
    const sku = req.body.sku?.trim() || null;
    const brand = req.body.brand?.trim() || null;
    const imageUrl = req.body.image_url?.trim() || req.body.imageUrl?.trim() || null;

    if (!name) {
      throw badRequest("El nombre del producto es obligatorio.");
    }
    if (!categoryId) {
      throw badRequest("Debes seleccionar una categoria valida.");
    }
    if (!description) {
      throw badRequest("La descripcion es obligatoria.");
    }

    const supabase = getSupabaseClient();

    const { data: createdPub, error: insertError } = await supabase
      .from("publications")
      .insert({
        name,
        category_id: categoryId,
        description,
        price,
        is_price_visible: Boolean(isPriceVisible),
        availability_status: availabilityStatus,
        sku,
        brand
      })
      .select("id, name, sku, brand, category_id, description, price, is_price_visible, availability_status, is_active, created_at, categories(id, name)")
      .single();

    if (insertError) {
      throw new Error(`Error al crear la publicacion: ${insertError.message}`);
    }

    let images = [];
    if (imageUrl) {
      const { data: imagePub, error: imageError } = await supabase
        .from("publication_images")
        .insert({
          publication_id: createdPub.id,
          image_url: imageUrl,
          alt_text: name,
          is_cover: true
        })
        .select("id, image_url, alt_text, is_cover");

      if (!imageError && imagePub) {
        images = imagePub;
      }
    }

    res.status(201).json({
      ok: true,
      message: "Publicacion creada correctamente.",
      data: {
        ...createdPub,
        publication_images: images
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePublicationController(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      throw badRequest("ID de publicacion invalido.");
    }

    const name = req.body.name?.trim() || "";
    const categoryId = Number(req.body.category_id || req.body.categoryId) || null;
    const description = req.body.description?.trim() || "";
    const priceInput = req.body.price;
    const price = priceInput !== "" && priceInput != null ? Number(priceInput) : null;
    const isPriceVisible = req.body.is_price_visible ?? req.body.isPriceVisible ?? true;
    const availabilityStatus = req.body.availability_status || req.body.availabilityStatus || "disponible";
    const sku = req.body.sku?.trim() || null;
    const brand = req.body.brand?.trim() || null;
    const isActive = req.body.is_active ?? req.body.isActive ?? true;
    const imageUrl = req.body.image_url?.trim() || req.body.imageUrl?.trim() || null;

    if (!name) {
      throw badRequest("El nombre del producto es obligatorio.");
    }
    if (!categoryId) {
      throw badRequest("Debes seleccionar una categoria valida.");
    }
    if (!description) {
      throw badRequest("La descripcion es obligatoria.");
    }

    const supabase = getSupabaseClient();

    const { data: updatedPub, error: updateError } = await supabase
      .from("publications")
      .update({
        name,
        category_id: categoryId,
        description,
        price,
        is_price_visible: Boolean(isPriceVisible),
        availability_status: availabilityStatus,
        sku,
        brand,
        is_active: Boolean(isActive)
      })
      .eq("id", id)
      .select("id, name, sku, brand, category_id, description, price, is_price_visible, availability_status, is_active, created_at, categories(id, name)")
      .single();

    if (updateError) {
      throw new Error(`Error al actualizar la publicacion: ${updateError.message}`);
    }

    if (imageUrl) {
      await supabase.from("publication_images").delete().eq("publication_id", id);
      await supabase.from("publication_images").insert({
        publication_id: id,
        image_url: imageUrl,
        alt_text: name,
        is_cover: true
      });
    }

    const { data: refreshedImages } = await supabase
      .from("publication_images")
      .select("id, image_url, alt_text, is_cover")
      .eq("publication_id", id);

    res.json({
      ok: true,
      message: "Publicacion actualizada correctamente.",
      data: {
        ...updatedPub,
        publication_images: refreshedImages || []
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function deletePublicationController(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      throw badRequest("ID de publicacion invalido.");
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from("publications")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      throw new Error(`Error al desactivar la publicacion: ${error.message}`);
    }

    res.json({
      ok: true,
      message: "Publicacion eliminada correctamente."
    });
  } catch (error) {
    next(error);
  }
}
