import express from "express";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import requireRestaurantUser from "../../../middlewares/requireRestaurantUser.js";
import roleMiddleware from "../../../middlewares/role.middleware.js";
import { getAllUsers, getUserById, updateMe, updateMyAvatar, updateUserRole, deleteUser } from "../controller/users.controller.js";
import { uploadCloud } from "../../../middlewares/uploadCloudinary.middleware.js";

const router = express.Router();

// router.get("/", authMiddleware,roleMiddleware("admin"),getAllUsers); should be active later
router.get("/", authMiddleware, requireRestaurantUser, roleMiddleware("admin"), getAllUsers);
router.get("/:id", authMiddleware, requireRestaurantUser, roleMiddleware("admin"), getUserById);
router.patch("/me", authMiddleware, updateMe);
router.post("/me/avatar", authMiddleware, uploadCloud.single("avatar"), updateMyAvatar);

// Admin only routes
router.put("/:id/role", authMiddleware, requireRestaurantUser, roleMiddleware("admin"), updateUserRole);
router.delete("/:id", authMiddleware, requireRestaurantUser, roleMiddleware("admin"), deleteUser);

export default router;

