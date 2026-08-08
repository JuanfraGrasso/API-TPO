export function healthController(req, res) {
  res.json({
    ok: true,
    service: "tpo-backend",
    timestamp: new Date().toISOString()
  });
}
