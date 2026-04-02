import Product from "../../models/productModel.js";
import { aiParseQuery } from "./aiParser.js";
import { buildQuery } from "./builder.js";

export const searchProducts1 = async (query, page = 1, limit = 10) => {
  const filters = await aiParseQuery(query);

  const { where, include } = await buildQuery(filters);

  const offset = (page - 1) * limit;

  const { rows = [], count = 0 } = await Product.findAndCountAll({
    where,
    include,
    limit,
    offset,
    order: [["price", "ASC"]],
  });

  return {
    filters,
    total: count || 0,
    page,
    results: rows || [],
  };
};

export const searchProducts = async (
  query,
  page = 1,
  limit = 10,
  sortBy = "price",
  order = "ASC",
) => {
  const filters = await aiParseQuery(query);

  const { where, include } = await buildQuery(filters);

  const offset = (page - 1) * limit;

  // 🔥 VALID SORT FIELDS (important for security)
  const allowedSortFields = ["price", "name", "createdAt"];

  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "price";

  const sortOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

  const { rows = [], count = 0 } = await Product.findAndCountAll({
    where,
    include,
    limit,
    offset,
    order: [[sortField, sortOrder]], // 🔥 SORTING
  });

  return {
    filters,
    total: count,
    page,
    sortBy: sortField,
    order: sortOrder,
    results: rows,
  };
};