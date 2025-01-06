"use strict";

const jwt = require("jsonwebtoken");

module.exports = {
  // Authentication middleware
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

  // Role-based authorization middleware
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

  // Pagination, filtering, and sorting middleware
  findSearchSortPage: (req, res, next) => {
    const filter = req.query?.filter || {};
    const search = req.query?.search || {};
    const sort = req.query?.sort || {};
    const limit = req.query?.limit
      ? Number(req.query.limit)
      : Number(process.env.PAGE_SIZE) || 20;
    const page = req.query?.page ? Number(req.query.page) : 1;

    const skip = limit ? (page - 1) * limit : 0;

    // Convert search parameters to MongoDB regex for case-insensitive matching
    for (let key in search) {
      search[key] = { $regex: search[key], $options: "i" };
    }

    // Attach helper methods to the response object
    res.getModelList = async function (
      Model,
      modelFilters = {},
      populate = null
    ) {
      try {
        const query = Model.find({ ...modelFilters, ...filter, ...search });
        if (populate) query.populate(populate);

        const result = await query.sort(sort).skip(skip).limit(limit);
        return result;
      } catch (err) {
        console.error("Error fetching model list:", err.message);
        throw err;
      }
    };

    res.getModelListDetails = async function (Model, modelFilters = {}) {
      try {
        const totalRecords = await Model.countDocuments({
          ...modelFilters,
          ...filter,
          ...search,
        });

        const totalPages = Math.ceil(totalRecords / limit);

        return {
          filter,
          search,
          sort,
          limit,
          skip,
          page,
          totalRecords,
          pages: {
            previous: page > 1 ? page - 1 : null,
            current: page,
            next: page < totalPages ? page + 1 : null,
            total: totalPages,
          },
        };
      } catch (err) {
        console.error("Error fetching model list details:", err.message);
        throw err;
      }
    };

    next();
  },
};
