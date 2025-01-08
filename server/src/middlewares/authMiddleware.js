// authMiddleware.js
const jwt = require("jsonwebtoken");

exports.authenticate = (req, res, next) => {
  const authHeader = req.headers?.authorization || null;
  if (!authHeader) {
    return res.status(401).json({ error: true, message: "No token provided." });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res
      .status(401)
      .json({ error: true, message: "Invalid token format." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid or expired token." });
    }

    req.user = decoded;
    next();
  });
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // user was set in authenticate
    if (!req.user) {
      return res.status(403).json({ error: true, message: "No permission." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: true, message: "Access denied." });
    }
    next();
  };
};
