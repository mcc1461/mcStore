"use strict";

module.exports = {
  authenticate: (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ error: true, message: "Authentication required." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ error: true, message: "Invalid token." });
    }
  },

  authorizeRoles:
    (...roles) =>
    (req, res, next) => {
      if (!req.user) {
        return res.status(403).json({ error: true, message: "No permission." });
      }

      // Allow 'self' access for specific routes
      if (roles.includes("self") && req.user._id === req.params.id) {
        return next();
      }

      // Check if the user role matches any allowed roles
      if (!roles.some((role) => req.user.role === role)) {
        return res.status(403).json({ error: true, message: "Access denied." });
      }

      next();
    },
};
