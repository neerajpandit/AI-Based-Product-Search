import { Op } from "sequelize";
import Category from "../../models/categoryModel.js";

export const buildQuery = async (filters = {}) => {
  const where = {};

  if (filters?.maxPrice) {
    where.price = { [Op.lte]: filters.maxPrice };
  }

 if (filters?.color) {
   where.color = {
     [Op.like]: `%${filters.color}%`,
   };
 }

  const include = [];

  if (filters?.category) {
    include.push({
      model: Category,
      as: "category", 
      where: {
        name: {
          [Op.like]: `%${filters.category}%`,
        },
      },
      required: true,
    });
  }

  return { where, include };
};
