import express from "express";
import BookingController from "./booking.controller.js";

const router = express.Router();

// quick endpoints
router.get("/today", (req, res, next) => BookingController.getToday(req, res, next));
router.get("/upcoming", (req, res, next) => BookingController.getUpcoming(req, res, next));
router.get("/by-date/:date", (req, res, next) => BookingController.getByDate(req, res, next));

router.post("/", (req, res, next) => BookingController.create(req, res, next));
router.get("/", (req, res, next) => BookingController.list(req, res, next));
router.get("/:id", (req, res, next) => BookingController.getById(req, res, next));
router.patch("/:id/status", (req, res, next) => BookingController.updateStatus(req, res, next));
router.put("/:id", (req, res, next) => BookingController.update(req, res, next));
router.delete("/:id", (req, res, next) => BookingController.remove(req, res, next));

export default router;
