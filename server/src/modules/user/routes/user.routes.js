import express from "express";
import requireRestaurantUser from "../../../middlewares/requireRestaurantUser.js";
import roleMiddleware from "../../../middlewares/role.middleware.js";
import { getAllUsers, getUserById, updateMe, updateMyAvatar, updateUserRole, deleteUser } from "../controller/users.controller.js";
import { uploadCloud } from "../../../middlewares/uploadCloudinary.middleware.js";

const router = express.Router();

// router.get("/", requireRestaurantUser, roleMiddleware("admin"), getAllUsers); should be active later
router.get("/", requireRestaurantUser, roleMiddleware("admin"), getAllUsers);
router.get("/:id", requireRestaurantUser, roleMiddleware("admin"), getUserById);
router.patch("/me", requireRestaurantUser, updateMe);
router.post("/me/avatar", requireRestaurantUser, uploadCloud.single("avatar"), updateMyAvatar);

// Admin only routes
router.put("/:id/role", requireRestaurantUser, roleMiddleware("admin"), updateUserRole);
router.delete("/:id", requireRestaurantUser, roleMiddleware("admin"), deleteUser);

export default router;

