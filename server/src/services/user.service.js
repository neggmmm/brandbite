import { env } from "../config/env";
import { findUserByEmail } from "../repositories/user.repository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createToken } from "../utils/jwtGen";

export const loginUserService = async (email, password) => {
  const user = await findUserByEmail(email);

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!user || !isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const token = createToken(user);
  return { user, token };
};
