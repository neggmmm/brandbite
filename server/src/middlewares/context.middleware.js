import jwt from "jsonwebtoken";
import User from "../modules/user/model/User.js";
import { env } from "../config/env.js";

export const contextMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

        // If no token provided, continue — this middleware only enriches request when auth present
        if (!token) {
            req.user = null;
            req.restaurantId = null;
            return next();
        }

        const decoded = jwt.verify(token, env.jwtKey);
        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) return res.status(401).json({ message: "User not found" });
        req.restaurantId = req.user.restaurantId || null;
        return next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};