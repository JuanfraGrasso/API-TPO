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
    const inviteCode = req.body.inviteCode?.trim() || "";

    if (!firstName || !lastName || !email || !password || !inviteCode) {
      res.status(400).json({ message: "Completa nombre, apellido, email, contraseña y código de invitación." });
      return;
    }

    if (!env.adminRegistrationSecret) {
      res.status(500).json({ message: "La registracion de administradores no esta configurada." });
      return;
    }

    if (inviteCode !== env.adminRegistrationSecret) {
      res.status(401).json({ message: "Codigo de invitacion invalido." });
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