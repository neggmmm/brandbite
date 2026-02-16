import logger from '../utils/logger.js';
import { ROLES } from '../config/constants.js';

const restaurantRoles = [ROLES.OWNER, ROLES.STAFF, ROLES.ADMIN];

const requireRestaurantUser = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

    // Super admin may operate without a restaurant context
    if (req.user.role === ROLES.SUPER_ADMIN) {
      req.restaurantId = null;
      return next();
    }

    if (!restaurantRoles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    if (!req.user.restaurantId) return res.status(400).json({ message: 'Missing restaurant context' });

    // attach restaurantId for convenience
    req.restaurantId = req.user.restaurantId;
    return next();
  } catch (err) {
    logger.error('requireRestaurantUser_error', { message: err.message });
    return res.status(500).json({ message: 'Internal error' });
  }
};

export default requireRestaurantUser;
