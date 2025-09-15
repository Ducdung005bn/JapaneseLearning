import express from 'express';
import dotenv from 'dotenv'; dotenv.config({ path: '.env.development.local' });

import * as authController from '../controllers/auth.controller.js';
import { uploadAvatar } from '../config/cloudinarystorage.js';

const router = express.Router();

router.post('/sendVerificationCode', authController.sendVerificationCode);
router.post('/verifyCode', authController.verifyCode);
router.post('/register', uploadAvatar, authController.register);

router.post('/login', authController.login);

router.post('/logout', authController.logout);

export default router;
