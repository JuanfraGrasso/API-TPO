import { getSupabaseClient } from "../config/supabaseClient.js";
import { createAdminSession, hashAdminPassword, verifyAdminPassword } from "../utils/adminAuth.js";
import { env } from "../config/env.js";

export async function loginController(req, res, next) {
  try {
    const email = req.body.email?.trim() || "";
    const password = req.body.password?.trim() || "";

    if (!email || !password) {
      res.status(400).json({ message: "Completa email y contraseña." });
      return;
    }

    if (env.adminEmail && env.adminPassword && email === env.adminEmail && password === env.adminPassword) {
      const sessionAdmin = {
        id: "local-admin",
        firstName: "Admin",
        lastName: "Local",
        email: env.adminEmail,
        role: "admin"
      };

      const token = createAdminSession(sessionAdmin);

      res.json({
        ok: true,
        message: "Bienvenido al panel administrador.",
        token,
        admin: sessionAdmin
      });
      return;
    }

    const supabase = getSupabaseClient();
    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("id, first_name, last_name, email, password_hash")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      throw new Error(`Supabase query error: ${error.message}`);
    }

    if (!admin) {
      res.status(401).json({ message: "Credenciales invalidas." });
      return;
    }

    const isPasswordValid = await verifyAdminPassword(password, admin.password_hash);

    if (!isPasswordValid) {
      res.status(401).json({ message: "Credenciales invalidas." });
      return;
    }

    const sessionAdmin = {
      id: admin.id,
      firstName: admin.first_name,
      lastName: admin.last_name,
      email: admin.email,
      role: "admin"
    };

    const token = createAdminSession(sessionAdmin);

    res.json({
      ok: true,
      message: "Bienvenido al panel administrador.",
      token,
      admin: sessionAdmin
    });
  } catch (error) {
    next(error);
  }
}

export function meController(req, res) {
  res.json({
    ok: true,
    admin: req.admin
  });
}

export async function registerController(req, res, next) {
  try {
    const firstName = req.body.firstName?.trim() || "";
    const lastName = req.body.lastName?.trim() || "";
    const email = req.body.email?.trim() || "";
    const phone = req.body.phone?.trim() || null;
    const password = req.body.password?.trim() || "";

    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ message: "Completa nombre, apellido, email y contraseña." });
      return;
    }

    if (!req.admin) {
      res.status(401).json({ message: "Solo un administrador autenticado puede crear otro administrador." });
      return;
    }

    const supabase = getSupabaseClient();
    const { data: existingAdmin, error: existingError } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingError) {
      throw new Error(`Supabase query error: ${existingError.message}`);
    }

    if (existingAdmin) {
      res.status(409).json({ message: "Ya existe un administrador con ese email." });
      return;
    }

    const passwordHash = await hashAdminPassword(password);
    const { data: createdAdmin, error: insertError } = await supabase
      .from("admin_users")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        password_hash: passwordHash
      })
      .select("id, first_name, last_name, email")
      .single();

    if (insertError) {
      throw new Error(`Supabase insert error: ${insertError.message}`);
    }

    const sessionAdmin = {
      id: createdAdmin.id,
      firstName: createdAdmin.first_name,
      lastName: createdAdmin.last_name,
      email: createdAdmin.email,
      role: "admin"
    };

    const token = createAdminSession(sessionAdmin);

    res.status(201).json({
      ok: true,
      message: "Administrador registrado correctamente.",
      token,
      admin: sessionAdmin
    });
  } catch (error) {
    next(error);
  }
}

function isLocalAdmin(admin) {
  return !admin?.id || admin.id === "local-admin";
}

export async function listAdminsController(req, res, next) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, first_name, last_name, email, phone, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Supabase query error: ${error.message}`);
    }

    res.json({ ok: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
}

export async function updateProfileController(req, res, next) {
  try {
    if (isLocalAdmin(req.admin)) {
      res.status(400).json({ message: "El administrador local no puede editar sus datos desde el panel." });
      return;
    }

    const firstName = req.body.firstName?.trim() || "";
    const lastName = req.body.lastName?.trim() || "";
    const email = req.body.email?.trim() || "";
    const phone = req.body.phone?.trim() || null;

    if (!firstName || !lastName || !email) {
      res.status(400).json({ message: "Completa nombre, apellido y email." });
      return;
    }

    const supabase = getSupabaseClient();
    const { data: existingAdmin, error: existingError } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", email)
      .neq("id", req.admin.id)
      .maybeSingle();

    if (existingError) {
      throw new Error(`Supabase query error: ${existingError.message}`);
    }

    if (existingAdmin) {
      res.status(409).json({ message: "Ya existe otro administrador con ese email." });
      return;
    }

    const { data: updatedAdmin, error: updateError } = await supabase
      .from("admin_users")
      .update({ first_name: firstName, last_name: lastName, email, phone })
      .eq("id", req.admin.id)
      .select("id, first_name, last_name, email")
      .single();

    if (updateError) {
      throw new Error(`Supabase update error: ${updateError.message}`);
    }

    const sessionAdmin = {
      id: updatedAdmin.id,
      firstName: updatedAdmin.first_name,
      lastName: updatedAdmin.last_name,
      email: updatedAdmin.email,
      role: "admin"
    };

    const token = createAdminSession(sessionAdmin);

    res.json({
      ok: true,
      message: "Datos personales actualizados correctamente.",
      token,
      admin: sessionAdmin
    });
  } catch (error) {
    next(error);
  }
}

export async function changePasswordController(req, res, next) {
  try {
    if (isLocalAdmin(req.admin)) {
      res.status(400).json({ message: "El administrador local no puede cambiar su contraseña desde el panel." });
      return;
    }

    const currentPassword = req.body.currentPassword || "";
    const newPassword = req.body.newPassword || "";

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: "Completa la contraseña actual y la nueva contraseña." });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: "La nueva contraseña debe tener al menos 6 caracteres." });
      return;
    }

    const supabase = getSupabaseClient();
    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("id, password_hash")
      .eq("id", req.admin.id)
      .maybeSingle();

    if (error) {
      throw new Error(`Supabase query error: ${error.message}`);
    }

    if (!admin) {
      res.status(404).json({ message: "No se encontro el administrador." });
      return;
    }

    const isPasswordValid = await verifyAdminPassword(currentPassword, admin.password_hash);

    if (!isPasswordValid) {
      res.status(401).json({ message: "La contraseña actual es incorrecta." });
      return;
    }

    const newPasswordHash = await hashAdminPassword(newPassword);
    const { error: updateError } = await supabase
      .from("admin_users")
      .update({ password_hash: newPasswordHash })
      .eq("id", req.admin.id);

    if (updateError) {
      throw new Error(`Supabase update error: ${updateError.message}`);
    }

    res.json({ ok: true, message: "Contraseña actualizada correctamente." });
  } catch (error) {
    next(error);
  }
}

export async function resetAdminPasswordController(req, res, next) {
  try {
    const targetId = req.params.id;
    const newPassword = req.body.password || req.body.newPassword || "";

    if (!targetId) {
      res.status(400).json({ message: "Administrador invalido." });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ message: "La nueva contraseña debe tener al menos 6 caracteres." });
      return;
    }

    const supabase = getSupabaseClient();
    const newPasswordHash = await hashAdminPassword(newPassword);
    const { data: updatedAdmin, error: updateError } = await supabase
      .from("admin_users")
      .update({ password_hash: newPasswordHash })
      .eq("id", targetId)
      .select("id, email")
      .maybeSingle();

    if (updateError) {
      throw new Error(`Supabase update error: ${updateError.message}`);
    }

    if (!updatedAdmin) {
      res.status(404).json({ message: "No se encontro el administrador indicado." });
      return;
    }

    res.json({
      ok: true,
      message: `Contraseña restablecida para ${updatedAdmin.email}.`
    });
  } catch (error) {
    next(error);
  }
}