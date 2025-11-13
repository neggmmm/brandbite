import { env } from "../config/env";
import User from "../models/User";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const decoded = jwt.verify(token, env.jwtKey);
    req.user = await User.findById(decoded._id).select("-password");
    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized" });
  }
};
export default authMiddleware;
