import User from "../models/userModel.js";
import { Op } from "sequelize";

// user Register Service
export const registerUserService = async (data) => {
    console.log("data",data);
    
  const { phoneNumber, email, username } = data;

  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ email }, { phoneNumber }, { username }],
    },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }
console.log("existingUser", existingUser);
  const user = await User.create(data);

  const userData = user.toJSON();
  delete userData.password;

  return userData;
};


export const loginUserService = async (data) => {
  const user = await User.findOne({
    where: {
      [Op.or]: [
        { username: data.identifier },
        { email: data.identifier },
        { phoneNumber: data.identifier },
      ],
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Password used directly, not exposed
  const isMatch = await user.isPasswordCorrect(data.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await user.save();

  const userData = user.toJSON();
  delete userData.password;
  delete userData.refreshToken;
  delete userData.refreshTokenExpiresAt;
  

  return {
    user: userData,
    accessToken,
    refreshToken,
  };
};
