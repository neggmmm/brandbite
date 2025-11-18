import express from "express";
import {
  forgetPasswordController,
  loginUserController,
  refreshTokenController,
  registerUserController,
  resetPasswordController,
  verifyOTP,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { getMe } from "../controllers/auth.controller.js";
import validatePassword from "../middlewares/validatePassword.middleware.js";

const router = express.Router();

router.post("/register", validatePassword, registerUserController);
router.post("/verifyOtp", verifyOTP);
router.post("/login", loginUserController);
router.get("/me", authMiddleware, getMe);
router.post("/refresh", refreshTokenController);
router.post("/forget", forgetPasswordController);
router.post("/reset", validatePassword, resetPasswordController);

export default router;
