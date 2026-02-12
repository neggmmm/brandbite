import mongoose from "mongoose";

const restaurantUserSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
    },
    points: {
        type: Number,
        default: 0,
        validate: {
            validator: function (val) {
                // value must be non-negative; allow 0 for customers; admins, etc. can have points but business logic will restrict them as needed
                return typeof val === "number" && val >= 0;
            },
            message: "Points must be a non-negative number",
        }
    },
},
    { timestamps: true }
);

restaurantUserSchema.index({ userId: 1, restaurantId: 1 }, { unique: true });
const RestaurantUser = mongoose.model("RestaurantUser", restaurantUserSchema);
export default RestaurantUser;