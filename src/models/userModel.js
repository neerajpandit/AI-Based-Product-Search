import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },

    username: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [3, 30],
        is: /^[a-zA-Z0-9_.-]+$/i,
      },
    },

    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^\+?[0-9]{7,15}$/,
      },
    },

    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    role: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2, // 0 SuperAdmin, 1 Admin, 2 User
      validate: {
        isIn: [[0, 1, 2]],
      },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    refreshToken: {
      type: DataTypes.TEXT,
    },

    refreshTokenExpiresAt: {
      type: DataTypes.DATE,
    },

    tokenVersion: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    passwordResetToken: {
      type: DataTypes.STRING,
    },

    passwordResetExpires: {
      type: DataTypes.DATE,
    },

    status: {
      type: DataTypes.ENUM("0", "1", "2", "3"), // 0 Active, 1 Inactive, 2 Suspended, 3 Deleted
      defaultValue: "0",
    },
  },
  {
    tableName: "users",
    timestamps: true,
  },
);


// Hash password before create
User.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

// Hash password before update
User.beforeUpdate(async (user) => {
  if (user.changed("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});


// Compare Password
User.prototype.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Generate Access Token
User.prototype.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this.id,
      role: this.role,
      phoneNumber: this.phoneNumber,
      username: this.username,
      tokenVersion: this.tokenVersion,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES,
    }
  );
};

// Generate Refresh Token
User.prototype.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this.id,
      tokenVersion: this.tokenVersion,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

export default User;