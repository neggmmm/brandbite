import express from 'express';
import * as couponController from './coupon.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';
import requireRestaurantUser from '../../middlewares/requireRestaurantUser.js';
import roleMiddleware from '../../middlewares/role.middleware.js';

const router = express.Router();

// ========== ADMIN ROUTES ==========
router.post('/admin/coupons', 
  authMiddleware,
  requireRestaurantUser,
  roleMiddleware('admin'), 
  couponController.createCoupon
);

router.get('/admin/coupons', 
  authMiddleware,
  requireRestaurantUser,
  roleMiddleware('admin'), 
  couponController.getAllCoupons
);

router.put('/admin/coupons/:couponId', 
  authMiddleware,
  requireRestaurantUser,
  roleMiddleware('admin'), 
  couponController.updateCoupon
);

router.delete('/admin/coupons/:couponId', 
  authMiddleware,
  requireRestaurantUser,
  roleMiddleware('admin'), 
  couponController.deleteCoupon
);

// ========== CUSTOMER ROUTES ==========
// Validate coupon by code (GET endpoint for checkout)
router.get('/coupons/validate/:code', 
  couponController.validateCouponByCode
);

// Validate coupon (POST endpoint with full validation)
router.post('/coupons/validate', 
  authMiddleware, 
  couponController.validateCoupon
);

router.post('/apply', 
  authMiddleware, 
  couponController.applyCoupon
);
export default router;