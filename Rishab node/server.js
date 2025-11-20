function fakeAuth(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  // Fake validation
  if (token !== "FAKE_TOKEN_123") {
    return res.status(403).json({ error: "Invalid token" });
  }

  next();
}

module.exports = fakeAuth;
