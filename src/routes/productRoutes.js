import express from "express";
import { verifyToken,authorizeRoles } from "../middleware/authMiddleware.js";
import { createProductController,updateProductController,deleteProductController,getAllProductsController } from "../controllers/productController.js";

const router = express.Router();

router.get("/",verifyToken, getAllProductsController);


router.post("/", verifyToken, authorizeRoles(1), createProductController);
router.put("/:id", verifyToken, authorizeRoles(1), updateProductController);
router.delete("/:id", verifyToken, authorizeRoles(1), deleteProductController);


export default router;
