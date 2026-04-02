import express from "express";
import { search } from "../controllers/searchController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/",verifyToken, search);

export default router;
