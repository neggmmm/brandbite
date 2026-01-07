import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    restaurantId: { type: String, index: true, required: true },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: "Table", required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    startTime: { type: String, required: true }, // HH:mm
    endTime: { type: String, required: true }, // HH:mm
    guests: { type: Number, default: 1 },
    customerName: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    customerEmail: { type: String, default: "" },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
  },
  { timestamps: true }
);

// index for quick lookups
BookingSchema.index({ restaurantId: 1, tableId: 1, date: 1 });

export default mongoose.model("Booking", BookingSchema);
