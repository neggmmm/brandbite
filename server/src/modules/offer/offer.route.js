import express from "express";
import {
  createOffer,
  getAllOffers,
  getActiveOffers,
  getOfferById,
  updateOffer,
  deleteOffer,
} from "./offer.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import requireRestaurantUser from "../../middlewares/requireRestaurantUser.js";
import roleMiddleware from "../../middlewares/role.middleware.js";

const router = express.Router();

// Public routes
router.get("/offers", getActiveOffers);
router.get("/offers/:id", getOfferById); 

// Admin routes
router.post(
  "/admin/offers",
  authMiddleware,
  requireRestaurantUser,
  roleMiddleware("admin"),
  createOffer
);
router.get(
  "/admin/offers",
  authMiddleware,
  requireRestaurantUser,
  roleMiddleware("admin"),
  getAllOffers
);
router.put(
  "/admin/offers/:id",
  authMiddleware,
  requireRestaurantUser,
  roleMiddleware("admin"),
  updateOffer
);
router.delete(
  "/admin/offers/:id",
  authMiddleware,
  requireRestaurantUser,
  roleMiddleware("admin"),
  deleteOffer
);

export default router;
