import sequelize from "../config/db.js";

import Product from "./productModel.js";
import Category from "./categoryModel.js";
import User from "./userModel.js";

Category.hasMany(Product, {
  foreignKey: "category_id",
  as: "products",
});

Product.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});

export { sequelize, Product, Category, User };
