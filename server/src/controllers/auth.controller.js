import { env } from "../config/env";
import { loginUserService } from "../services/user.service";

export const loginUserController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = loginUserService(email, password);
    res.cookie("token", token, {
      httpOnly: true,
      secure: env.nodeEnv === "production",
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "none",
    });
    res.status(200).json({
      message: "Logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
export const getMe = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
