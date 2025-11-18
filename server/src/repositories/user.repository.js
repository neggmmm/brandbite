import User from "../models/User.js";

export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

export const findUserByResetToken = async (token) => {
  return await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
};

export const addUser = async (user) => {
  return await User.create(user);
};
export const saveRefreshToken = async (userId, token) => {
  await User.findByIdAndUpdate(userId, { refreshToken: token });
};

export const getUserByRefreshToken = async (token) => {
  return User.findOne({ refreshToken: token });
};
