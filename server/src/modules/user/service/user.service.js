import { 
  findAllUsers, 
  findUserById, 
  updateUserProfile, 
  updateUserRoleById, 
  updateUserAvatar,
  deleteUserById 
} from "../repository/user.repository.js";

const VALID_ROLES = ["customer", "admin", "kitchen", "cashier"];

export const getAllUsersService = async (restaurantId = null) => {
  const users = await findAllUsers(restaurantId);
  return users;
};

export const getUserByIdService = async (id, restaurantId = null, requestingUser = null) => {
  const user = await findUserById(id);
  if (!user) return null;

  // If requesting user is super admin allow cross-restaurant fetch
  if (requestingUser && requestingUser.role === 'super_admin') return user;

  // Otherwise ensure the user belongs to the same restaurant (or has no restaurant)
  if (restaurantId && user.restaurantId && user.restaurantId.toString() !== restaurantId.toString()) {
    return null;
  }

  return user;
};

export const updateMeService = async (userId, payload) => {
  return await updateUserProfile(userId, payload);
};

export const updateUserRoleService = async (userId, role) => {
  if (!VALID_ROLES.includes(role)) {
    throw new Error("Invalid role");
  }
  const user = await updateUserRoleById(userId, role);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const updateUserAvatarService = async (userId, avatarUrl) => {
  const user = await updateUserAvatar(userId, avatarUrl);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const deleteUserService = async (userId) => {
  const user = await deleteUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

