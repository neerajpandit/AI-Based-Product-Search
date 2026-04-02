import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: "Category name is required",
        },
      },
    },
  },
  {
    tableName: "categories",
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: ["name"],
      },
    ],
  },
);

export default Category;
