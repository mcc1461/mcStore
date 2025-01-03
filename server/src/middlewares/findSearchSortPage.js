module.exports = (req, res, next) => {
  let filter = req.query?.filter || {};
  let search = req.query?.search || {};

  // Convert search parameters to MongoDB regex for case-insensitive matching
  for (let key in search) {
    search[key] = { $regex: search[key], $options: "i" };
  }

  let sort = req.query?.sort || {};
  let limit = req.query?.limit
    ? Number(req.query.limit)
    : Number(process.env.PAGE_SIZE) || 20;

  // Handle limit: if limit is -1, fetch all records
  if (limit === -1) {
    limit = null; // No limit
  } else {
    limit = limit > 0 ? limit : 20; // Default to 20
  }

  // Correct page handling
  let page = req.query?.page ? Number(req.query.page) : 1; // Default to page 1
  page = page > 0 ? page : 1; // Ensure page is always >= 1

  let skip = limit ? (page - 1) * limit : 0; // Calculate `skip`

  // Debugging logs
  console.log("Filter:", filter);
  console.log("Search:", search);
  console.log("Sort:", sort);
  console.log("Limit:", limit);
  console.log("Page:", page);
  console.log("Skip:", skip);

  res.getModelList = async function (
    Model,
    modelFilters = {},
    populate = null
  ) {
    try {
      const result = await Model.find({ ...modelFilters, ...filter, ...search })
        .sort(sort)
        .skip(skip)
        .limit(limit || 0) // No limit applied if limit is null
        .populate(populate);

      console.log("Result count:", result.length); // Log the count of returned results
      return result;
    } catch (err) {
      console.error("Error fetching model list:", err);
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

      const totalPages = limit ? Math.ceil(totalRecords / limit) : 1;

      return {
        filter,
        search,
        sort,
        limit: limit || "All", // Show "All" when no limit is applied
        skip,
        page, // Return the correct page
        totalRecords,
        pages: limit
          ? {
              previous: page > 1 ? page - 1 : false,
              current: page,
              next: page < totalPages ? page + 1 : false,
              total: totalPages,
            }
          : false, // No pagination when limit is null
      };
    } catch (err) {
      console.error("Error fetching model list details:", err);
      throw err;
    }
  };

  next();
};
