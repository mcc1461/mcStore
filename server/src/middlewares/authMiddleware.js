"use strict";
const jwt = require("jsonwebtoken");

const publicPaths = ["/api/auth/forgotPassword", "/api/auth/resetPassword"];

exports.authenticate = (req, res, next) => {
  // If the request URL is one of the public paths, skip token verification
  if (publicPaths.some((path) => req.originalUrl.includes(path))) {
    return next();
  }

  const authHeader = req.headers?.authorization;
  if (!authHeader) {
    console.log("No Authorization header provided.");
    return res.status(401).json({ error: true, message: "No token provided." });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    console.log("Invalid token format.");
    return res
      .status(401)
      .json({ error: true, message: "Invalid token format." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("Token verification failed:", err.message);
      return res
        .status(401)
        .json({ error: true, message: "Invalid or expired token." });
    }
    console.log("Decoded token:", decoded);
    req.user = decoded;
    next();
  });
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({
        error: true,
        message: "No permission. Authentication required.",
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: true,
        message: `Access denied. Requires one of the following roles: ${roles.join(
          ", "
        )}`,
      });
    }
    next();
  };
};
