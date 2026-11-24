import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";

let supabaseServer;
let apiServer;
let apiUrl;
let token;
let comments = [];
let lastAuthorization;

before(async () => {
  supabaseServer = createServer(async (req, res) => {
    lastAuthorization = req.headers.authorization;
    res.setHeader("Content-Type", "application/json");
    const url = new URL(req.url, "http://localhost");
    if (url.pathname !== "/rest/v1/inquiry_comments") {
      res.writeHead(404).end(JSON.stringify({ message: "Unknown table" }));
      return;
    }

    if (req.method === "GET") {
      const inquiryId = Number(url.searchParams.get("inquiry_id")?.replace("eq.", ""));
      res.end(JSON.stringify(comments.filter((comment) => comment.inquiry_id === inquiryId)));
      return;
    }

    let body = "";
    for await (const chunk of req) body += chunk;
    const comment = JSON.parse(body);
    if (comment.inquiry_id === 999) {
      res.writeHead(400).end(JSON.stringify({ message: "Consulta inexistente" }));
      return;
    }
    const saved = { ...comment, id: comments.length + 1, created_at: "2026-01-01T12:00:00Z" };
    comments.push(saved);
    res.writeHead(201).end(JSON.stringify(saved));
  });
  await new Promise((resolve) => supabaseServer.listen(0, "127.0.0.1", resolve));
  process.env.SUPABASE_URL = `http://127.0.0.1:${supabaseServer.address().port}`;
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
  process.env.ADMIN_SESSION_SECRET = "test-session-secret";

  const { app } = await import("../src/app.js");
  const { createAdminSession } = await import("../src/utils/adminAuth.js");
  token = createAdminSession({ id: "local-admin", firstName: "Admin", lastName: "Local", email: "admin@example.com" });
  apiServer = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => apiServer.once("listening", resolve));
  apiUrl = `http://127.0.0.1:${apiServer.address().port}/api`;
});

after(async () => {
  if (apiServer) await new Promise((resolve) => apiServer.close(resolve));
  if (supabaseServer) await new Promise((resolve) => supabaseServer.close(resolve));
});

function request(path, options = {}) {
  return fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.auth === false ? {} : { Authorization: `Bearer ${token}` })
    }
  });
}

test("los comentarios requieren sesión para lectura y escritura", async () => {
  for (const method of ["GET", "POST"]) {
    const response = await request("/inquiries/1/comments", {
      method,
      auth: false,
      ...(method === "POST" ? { body: JSON.stringify({ message: "Nota" }) } : {})
    });
    assert.equal(response.status, 401);
  }
});

test("valida identificador y contenido antes de guardar", async () => {
  for (const [id, message] of [["0", "nota"], ["1.5", "nota"], ["1", "  "], ["1", 42], ["1", "a".repeat(2001)]]) {
    const response = await request(`/inquiries/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ message })
    });
    assert.equal(response.status, 400);
  }
  assert.equal(comments.length, 0);
});

test("guarda y recupera el historial usando el autor de la sesión", async () => {
  const response = await request("/inquiries/1/comments", {
    method: "POST",
    body: JSON.stringify({ message: "  Contactado por teléfono  ", author_name: "Otro" })
  });
  assert.equal(response.status, 201);
  const result = await response.json();
  assert.equal(result.data.message, "Contactado por teléfono");
  assert.equal(result.data.author_name, "Admin Local");
  assert.equal(comments[0].author_id, "local-admin");
  assert.equal(lastAuthorization, "Bearer test-service-key");

  const listing = await request("/inquiries/1/comments");
  assert.equal(listing.status, 200);
  assert.equal((await listing.json()).data.length, 1);
  const other = await request("/inquiries/2/comments");
  assert.deepEqual((await other.json()).data, []);
});

test("no oculta los errores de almacenamiento", async () => {
  const response = await request("/inquiries/999/comments", {
    method: "POST",
    body: JSON.stringify({ message: "Nota" })
  });
  assert.equal(response.status, 500);
  assert.match((await response.json()).message, /Consulta inexistente/);
});
