"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev
------------------------------------------------------- */
// authentication.js | Middleware

const jwt = require("jsonwebtoken");

/**
 * Middleware to verify and decode the JWT token
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers?.authorization || null; // Bearer ...accessToken...

  if (authHeader) {
    const [scheme, token] = authHeader.split(" "); // ['Bearer', '...accessToken...']

    if (scheme === "Bearer" && token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          console.log("Token verification failed:", err.message);
          return res.status(401).json({
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
      console.log("Invalid token format.");
      return res.status(401).json({
        error: true,
        message: "Invalid token format. Please log in again.",
      });
    }
  } else {
    // No authorization header
    console.log("No Authorization header provided.");
    return res.status(401).json({
      error: true,
      message: "No authorization header. Please log in.",
    });
  }
};

/**
 * Middleware to check for specific roles
 * @param  {...string} roles - Allowed roles
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Ensure user information is set in the request object
    if (!req.user) {
      return res.status(403).json({
        error: true,
        message: "Access denied. You are not logged in.",
      });
    }

    // Check if the user's role is authorized
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: true,
        message: `Access denied. Requires one of the following roles: ${roles.join(
          ", "
        )}.`,
      });
    }

    // Proceed to the next middleware
    next();
  };
};

module.exports = {
  authenticate,
  authorizeRoles,
};
