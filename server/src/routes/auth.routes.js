import express from "express";
import { loginUserController } from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth.middleware";
import { getMe } from "../services/user.controller";

const router = express.Router();

router.post("/register");
router.post("/login", loginUserController);
router.get("/me", authMiddleware, getMe);

export default router;
