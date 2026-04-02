import { Product } from "../models/index.js";
import { Op } from "sequelize";
// CREATE
export const createProduct = async (data) => {
  return await Product.create(data);
};

// GET ALL

export const getProducts = async (page = 1, pageSize = 10) => {
  const offset = (page - 1) * pageSize; // skip rows for previous pages

  // Get products with pagination
  const { rows: products, count: total } = await Product.findAndCountAll({
    where: {
      status: { [Op.not]: "2" }, // exclude soft-deleted products
    },
    order: [["createdAt", "DESC"]],
    limit: pageSize,
    offset,
  });

  // Optional: return metadata for frontend
  return {
    products,
    meta: {
      total, // total number of products
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};
// UPDATE
export const updateProduct = async (id, data) => {
  const product = await Product.findByPk(id);

  if (!product) {
    throw new Error("Product not found");
  }

  await product.update(data);
  return product;
};

// DELETE
export const deleteProduct = async (id) => {
  const product = await Product.findByPk(id);

  if (!product) {
    throw new Error("Product not found");
  }

    product.status = "2";
    await product.save();
};
