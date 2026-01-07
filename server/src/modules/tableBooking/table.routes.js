import express from "express";
import TableController from "./table.controller.js";

const router = express.Router();
// availability check
router.get("/availability", (req, res, next) => TableController.getAvailability(req, res, next));
// floor plan
router.get("/floor-plan", (req, res, next) => TableController.getFloorPlan(req, res, next));
// filter by capacity
router.get("/by-capacity", (req, res, next) => TableController.getByCapacity(req, res, next));

router.post("/", (req, res, next) => TableController.create(req, res, next));
router.get("/", (req, res, next) => TableController.list(req, res, next));
router.patch("/:id/status", (req, res, next) => TableController.updateStatus(req, res, next));
router.put("/:id", (req, res, next) => TableController.update(req, res, next));
router.delete("/:id", (req, res, next) => TableController.remove(req, res, next));

export default router;
