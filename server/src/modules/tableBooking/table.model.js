import mongoose from "mongoose";

const TableSchema = new mongoose.Schema(
  {
    restaurantId: { type: String, index: true, required: true },
    name: { type: String, required: true },
    capacity: { type: Number, default: 1 },
    location: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    // status used for realtime table state on floor plan
    status: { type: String, enum: ["available", "occupied", "reserved"], default: "available" },
  },
  { timestamps: true }
);

export default mongoose.model("Table", TableSchema);
