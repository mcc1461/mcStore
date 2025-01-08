"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev
------------------------------------------------------- */
// authentication.js | Middleware

const jwt = require("jsonwebtoken");

module.exports = {
  // Middleware to verify and decode the JWT token
  authenticate: (req, res, next) => {
    const authHeader = req.headers?.authorization || null; // Bearer ...accessToken...

    if (authHeader) {
      const [scheme, token] = authHeader.split(" "); // ['Bearer', '...accessToken...']

      if (scheme === "Bearer" && token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
          if (err) {
            return res.status(401).send({
              error: true,
              message: "Invalid or expired token. Please log in again.",
            });
          }
          // Token is valid, set user data
          req.user = decoded;
          next();
        });
      } else {
        // Invalid token format
        return res.status(401).send({
          error: true,
          message: "Invalid token format. Please log in again.",
        });
      }
    } else {
      // No authorization header
      return res.status(401).send({
        error: true,
        message: "No authorization header. Please log in.",
      });
    }
  },

  // Middleware to check for specific roles
  authorizeRoles: (...roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(403).send({
          error: true,
          message: "Access denied. You are not logged in.",
        });
      }
      if (!roles.includes(req.user.role)) {
        return res.status(403).send({
          error: true,
          message: `Access denied. Required role(s): ${roles.join(", ")}.`,
        });
      }
      next();
    };
  },
};
