import express from "express";

import authRoutes from "./authRoutes.js";
import searchRoutes from "./searchRoutes.js";
import productRoutes from "./productRoutes.js";

const router = express.Router();

router.use("/v1/auth", authRoutes);
router.use("/v1/search", searchRoutes);
router.use("/v1/products", productRoutes);

export default router;
