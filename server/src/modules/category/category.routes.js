import express from "express";
const router = express.Router();
import { getAllCategories ,getCategoryById,addCategory,updateCategory,deleteCategory} from "./category.controller.js";

import { uploadCloud } from "../../middlewares/uploadCloudinary.middleware.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import requireRestaurantUser from "../../middlewares/requireRestaurantUser.js";
import roleMiddleware from "../../middlewares/role.middleware.js";

router.get("/", getAllCategories);
router.get('/:id',getCategoryById);
router.post('/', authMiddleware, requireRestaurantUser, roleMiddleware('admin'), uploadCloud.single('categoryImage'), addCategory);
router.put('/:id', authMiddleware, requireRestaurantUser, roleMiddleware('admin'), uploadCloud.single('categoryImage'), updateCategory);
router.delete('/:id', authMiddleware, requireRestaurantUser, roleMiddleware('admin'), deleteCategory)
export default router;