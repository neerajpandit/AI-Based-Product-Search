import sequelize from "../config/db.js";
import { seedCategories } from "./categorySeeder.js";
import { seedProducts } from "./productSeeder.js";

export const runSeeders = async () => {
  const transaction = await sequelize.transaction();

  try {
    console.log("🌱 Starting seeding...");

    await seedCategories(transaction);
    await seedProducts(transaction);

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    console.error("Seeding failed:", error.message);
    throw error;
  }
};
