import User from "../models/User";

export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};
