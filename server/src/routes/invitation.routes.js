import express from 'express';
import admin from '../config/firebaseAdmin.js';
import Invitation from '../modules/supadmin/models/Invitation.js';
import User from '../modules/user/model/User.js';
import Restaurant from '../modules/restaurant/restaurant.model.js';
import { createAccessToken, createRefreshToken } from '../utils/jwt.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Validate token without consuming
router.get('/validate/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const invite = await Invitation.findOne({ token }).lean();
    if (!invite) return res.status(404).json({ message: 'Invitation not found' });
    if (invite.used) return res.status(400).json({ message: 'Invitation already used' });
    if (invite.expiresAt && new Date() > new Date(invite.expiresAt)) return res.status(400).json({ message: 'Invitation expired' });

    const restaurant = await Restaurant.findById(invite.restaurantId).select('restaurantName').lean();

    logger.info('invitation_validated', { invitationId: invite._id, email: invite.email, restaurantId: invite.restaurantId });
    res.json({ valid: true, invitation: { email: invite.email, role: invite.role, restaurantId: invite.restaurantId }, restaurant });
  } catch (err) {
    logger.error('invitation_validate_error', { message: err.message });
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept invitation and create owner account (using Firebase Admin + existing JWT utilities)
router.post('/accept', async (req, res) => {
  try {
    const { token, name, email, password } = req.body;
    if (!token) return res.status(400).json({ message: 'Token required' });

    const invite = await Invitation.findOne({ token });
    if (!invite) return res.status(404).json({ message: 'Invitation not found' });
    if (invite.used) return res.status(400).json({ message: 'Invitation already used' });
    if (invite.expiresAt && new Date() > new Date(invite.expiresAt)) return res.status(400).json({ message: 'Invitation expired' });

    const ownerEmail = email || invite.email;
    if (!ownerEmail) return res.status(400).json({ message: 'Email is required' });

    // Check if user already exists with this email
    const existing = await User.findOne({ email: ownerEmail });
    if (existing) return res.status(400).json({ message: 'A user with this email already exists' });

    let firebaseUser;
    try {
      // Create Firebase user with email and password
      firebaseUser = await admin.auth().createUser({
        email: ownerEmail,
        password: password || 'TempPassword123!', // Fallback if no password provided
        displayName: name || ''
      });
    } catch (firebaseErr) {
      logger.error('firebase_user_creation_failed', { message: firebaseErr.message, email: ownerEmail });
      if (firebaseErr.code === 'auth/email-already-exists') {
        return res.status(400).json({ message: 'Email already exists in Firebase' });
      }
      throw firebaseErr;
    }

    // Create MongoDB user linked to restaurant
    const user = await User.create({
      name: name || '',
      email: ownerEmail,
      firebaseUid: firebaseUser.uid,
      role: 'restaurant_owner',
      restaurantId: invite.restaurantId,
      isVerified: true
    });

    // Mark invitation as used
    invite.used = true;
    await invite.save();

    // Create access and refresh tokens using existing utilities
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    logger.info('restaurant_owner_created_via_invitation', {
      userId: user._id,
      restaurantId: invite.restaurantId,
      email: ownerEmail,
      firebaseUid: firebaseUser.uid
    });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    logger.error('invitation_accept_error', { message: err.message });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
