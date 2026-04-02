import {
  registerUserService,
  loginUserService,
} from "../services/authService.js";

// Register User
export const registerController = asyncHandler(async (req, res) => {
  try {
    const user = await registerUserService(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Login
export const loginController = asyncHandler(async (req, res) => {
  try {
    const result = await loginUserService(req.body);

    // Cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    };

    // Set cookies
    res.cookie("accessToken", result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.cookie("refreshToken", result.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
});

// Logout
import User from "../models/userModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const logoutController = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?.id;

    if (userId) {
      // Invalidate refresh token in DB
      const user = await User.findByPk(userId);
      if (user) {
        user.refreshToken = null; // remove refresh token
        user.refreshTokenExpiresAt = null; // remove expiry
        user.tokenVersion += 1; // optional: force logout everywhere
        await user.save();
      }
    }

    // Clear cookies in browser
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
});