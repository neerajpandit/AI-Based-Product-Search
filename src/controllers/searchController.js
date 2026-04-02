import { searchProducts } from "../services/search/searchService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const search =asyncHandler (async (req, res) => {
  try {
    const {
      q,
      page = 1,
      limit = 10,
      sortBy = "price",
      order = "ASC",
    } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search query (q) is required",
      });
    }

    const data = await searchProducts(
      q,
      Number(page),
      Number(limit),
      sortBy,
      order,
    );

    res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
