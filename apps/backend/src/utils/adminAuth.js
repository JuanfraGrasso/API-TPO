import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

const ADMIN_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function encode(value) {
  return Buffer.from(value).toString("base64url");
}

function decode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value) {
  return crypto.createHmac("sha256", env.adminSessionSecret).update(value).digest("base64url");
}

export function createAdminSession(admin) {
  if (!env.adminSessionSecret) {
    throw new Error("ADMIN_SESSION_SECRET is missing.");
  }

  const payload = {
    admin,
    exp: Date.now() + ADMIN_SESSION_TTL_MS
  };

  const encodedPayload = encode(JSON.stringify(payload));
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifyAdminSession(token) {
  if (!token || !env.adminSessionSecret) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(decode(encodedPayload));

    if (!payload.exp || Date.now() > payload.exp) {
      return null;
    }

    return payload.admin || null;
  } catch {
    return null;
  }
}

export function requireAdminAuth(req, res, next) {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    res.status(401).json({ message: "No autorizado" });
    return;
  }

  const admin = verifyAdminSession(token);

  if (!admin) {
    res.status(401).json({ message: "Sesion de administrador invalida o expirada" });
    return;
  }

  req.admin = admin;
  next();
}

export function verifyAdminPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export function hashAdminPassword(password) {
  return bcrypt.hash(password, 10);
}