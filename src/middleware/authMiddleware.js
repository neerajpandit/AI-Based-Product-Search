import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyToken = asyncHandler(async (req, res, next) => {
  try {
    // 🍪 Get tokens from cookies OR headers
    const accessToken =
      req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    const refreshToken = req.cookies?.refreshToken;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No access token",
      });
    }

    // 🔐 Verify access token
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    // 🔍 Find user in DB
    const user = await User.findOne({
      where: {
        id: decoded.id,
        tokenVersion: decoded.tokenVersion,
        refreshToken: refreshToken,
        status: "0", // active user
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Session invalid or expired",
      });
    }

    // ⏳ Check refresh token expiry manually
    if (
      user.refreshTokenExpiresAt &&
      new Date(user.refreshTokenExpiresAt) < new Date()
    ) {
      return res.status(401).json({
        success: false,
        message: "Refresh token expired",
      });
    }

    // ❌ Remove password before attaching
    const userData = user.toJSON();
    delete userData.password;

    req.user = userData;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
});

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};