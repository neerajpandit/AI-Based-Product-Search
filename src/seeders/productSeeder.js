
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import { productsData } from "./data/productsData.js";

export const seedProducts = async (transaction) => {
  const categories = await Category.findAll({ transaction });

  const categoryMap = {};
  categories.forEach((c) => {
    categoryMap[c.name] = c.id;
  });

  const existingProducts = await Product.findAll({
    attributes: ["name"],
    where: {
      status: "0", // only active products
    },
    transaction,
  });

  const existingSet = new Set(existingProducts.map((p) => p.name));

  const newProducts = productsData
    .filter((p) => !existingSet.has(p.name))
    .map((p) => ({
      name: p.name,
      category_id: categoryMap[p.category],
      price: p.price,
      color: p.color,
      description: p.description,
      tags: p.tags,
      status: "0",
    }));

  if (!newProducts.length) {
    console.log("Products already exist");
    return;
  }

  await Product.bulkCreate(newProducts, {
    transaction,
    validate: true,
  });

  console.log(`Inserted ${newProducts.length} products`);
};
