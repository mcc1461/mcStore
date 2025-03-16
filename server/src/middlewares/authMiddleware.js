const jwt = require("jsonwebtoken");

// Middleware for authentication
exports.authenticate = (req, res, next) => {
  const authHeader = req.headers?.authorization || null;

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

    console.log("Decoded token:", decoded); // Log the decoded token
    req.user = decoded;
    next();
  });
};

// Middleware for role-based authorization
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Ensure user information is set in the request object
    if (!req.user) {
      return res.status(403).json({
        error: true,
        message: "No permission. Authentication required.",
      });
    }

    // Check if the user's role is authorized
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: true,
        message: `Access denied. Requires one of the following roles: ${roles.join(
          ", "
        )}`,
      });
    }

    // Proceed to the next middleware
    next();
  };
};
