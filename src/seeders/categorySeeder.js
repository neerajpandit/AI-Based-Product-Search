import Category from "../models/categoryModel.js";
import { categoriesData } from "./data/categoriesData.js";

export const seedCategories = async (transaction) => {
  const existing = await Category.findAll({
    attributes: ["name"],
    transaction,
  });

  const existingSet = new Set(existing.map((c) => c.name));

  const newCategories = categoriesData.filter((c) => !existingSet.has(c.name));

  if (!newCategories.length) {
    console.log("Categories already exist");
    return;
  }

  await Category.bulkCreate(newCategories, {
    transaction,
    validate: true,
  });

  console.log(`✅ Inserted ${newCategories.length} categories`);
};
