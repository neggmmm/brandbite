import express from 'express';
import { AddReward, deleteReward, getAllRewards, getRewardById, redeemReward, updateReward, getAllRewardOrder, getRewardOrderById, updateRewardOrder, deleteRewardOrder, getUserRedemptions } from './reward.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';
import requireRestaurantUser from '../../middlewares/requireRestaurantUser.js';
import roleMiddleware from '../../middlewares/role.middleware.js';
import { uploadCloud } from '../../middlewares/uploadCloudinary.middleware.js';
const router = express.Router();

router.get('/', getAllRewards);
// Authenticated users can view their own redemptions - MUST be before /:id
router.get('/my-redemptions', authMiddleware, getUserRedemptions);
// Reward order management (admin) - must be placed before `/:id` to avoid conflict
router.get('/reward-order', authMiddleware, requireRestaurantUser, roleMiddleware('admin'), getAllRewardOrder);
router.get('/reward-order/:id', authMiddleware, requireRestaurantUser, roleMiddleware('admin'), getRewardOrderById);
router.patch('/reward-order/:id', authMiddleware, requireRestaurantUser, roleMiddleware('admin'), updateRewardOrder);
router.delete('/reward-order/:id', authMiddleware, requireRestaurantUser, roleMiddleware('admin'), deleteRewardOrder);
router.get('/:id', getRewardById);
// Admin-only operations
router.post('/', authMiddleware, requireRestaurantUser, roleMiddleware('admin'), uploadCloud.single('image'), AddReward);
router.delete('/:id', authMiddleware, requireRestaurantUser, roleMiddleware('admin'), deleteReward);
router.patch('/:id', authMiddleware, requireRestaurantUser, roleMiddleware('admin'), uploadCloud.single('image'), updateReward);
// Authenticated users can redeem rewards for themselves
router.post('/redeem', authMiddleware, redeemReward);
// router.patch('/user/:id', authMiddleware, roleMiddleware('admin'), updatePoints);
export default router;