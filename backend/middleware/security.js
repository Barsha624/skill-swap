// Small dependency-free security helpers.

// Standard hardening headers (same intent as the `helmet` package).
function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
  next();
}

// Fixed-window in-memory rate limiter, keyed by IP.
function rateLimit({ windowMs, max, message = "Too many attempts, try again later" }) {
  const hits = new Map();
  setInterval(() => { const now = Date.now(); for (const [k, v] of hits) if (v.reset < now) hits.delete(k); }, windowMs).unref();
  return (req, res, next) => {
    const now = Date.now();
    const rec = hits.get(req.ip);
    if (!rec || rec.reset < now) { hits.set(req.ip, { count: 1, reset: now + windowMs }); return next(); }
    if (++rec.count > max) {
      res.setHeader("Retry-After", Math.ceil((rec.reset - now) / 1000));
      return res.status(429).json({ message });
    }
    next();
  };
}

// Input helpers: only accept plain strings (blocks NoSQL operator objects like {"$ne": ""}).
const str = (v, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isEmail = (s) => /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(s);

module.exports = { securityHeaders, rateLimit, str, escapeRegex, isEmail };
