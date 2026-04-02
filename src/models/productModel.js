import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Product name is required",
        },
      },
    },

    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: "Price must be positive",
        },
      },
    },

    color: {
      type: DataTypes.STRING,
    },

    description: {
      type: DataTypes.TEXT,
    },

    tags: {
      type: DataTypes.STRING, // comma-separated
    },
    status: {
      type: DataTypes.ENUM("0", "1", "2", "3"),
      defaultValue: "0",
    },
  },
  {
    tableName: "products",
    timestamps: true,

    // Here indexes
    indexes: [
      { fields: ["name"] },
      { fields: ["price"] },
      { fields: ["color"] },
      { fields: ["category_id"] },
    ],
  },
);

export default Product;
