import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    avatarUrl: { type: String, default: "" },
    phoneNumber: {
      type: String,
      trim: true,
      sparse: true,
      minlength: [11, "Phone number must be 11 characters long"],
    },
    email: {
      type: String,
      sparse: true,
    },
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
 
    address: {
      country: { type: String, default: "" },
      cityState: { type: String, default: "" },
      postalCode: { type: String, default: "" },
      taxId: { type: String, default: "" },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      select: false
    },
   
    orderHistory: [{
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
      },
      orderNumber: {
        type: String,
        required: true
      },
      totalAmount: {
        type: Number,
        required: true
      },
      status: {
        type: String,
        enum: ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"],
        default: "pending"
      },
      date: {
        type: Date,
        default: Date.now
      },
      itemsCount: {
        type: Number,
        default: 0
      },
      serviceType: {
        type: String,
        enum: ["dine-in", "pickup", "delivery"]
      }
    }],
    coupon: {
      usedCoupons: [
        {
          couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
          code: String,
          usedAt: { type: Date, default: Date.now }
        }
      ]
    },
  },
  { timestamps: true }
);

userSchema.index({ phoneNumber: 1 });

// Validation: Super admins must not be associated with a restaurant
userSchema.pre("validate", function (next) {
  if (this.role === "super_admin" && this.restaurantId) {
    return next(new Error("super_admin must not have a restaurantId"));
  }
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
