import {
  getAllUsersService,
  getUserByIdService,
  updateMeService,
} from "../service/user.service.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersService();
    res.status(200).json({
      users,
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserByIdService(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: err.message });
  }
};

export const updateMe = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const updated = await updateMeService(userId, req.body || {});
    return res.status(200).json({ user: updated });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
};

