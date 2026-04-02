import express from "express";
import { registerController, loginController,logoutController } from "../controllers/authController.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
  registerSchema,
  loginSchema,
} from "../validators/authValidation.js";
import { verifyToken } from "../middleware/authMiddleware.js";
const router = express.Router();


router.post("/register", validate(registerSchema), registerController);
router.post("/login", validate(loginSchema), loginController);
router.post("/logout",verifyToken, logoutController);

export default router;