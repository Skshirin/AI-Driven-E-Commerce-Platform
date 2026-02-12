import express from 'express';
import { login, register, logout, getUser, forgotPassword,resetPassword, updatePassword, updateProfile } from '../controllers/authController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login', login);

router.post('/register', register);

router.get('/logout', isAuthenticated, logout);

router.get('/me', isAuthenticated, getUser);

router.post('/password/forgot', forgotPassword);

router.put('/password/reset/:token', resetPassword);

router.put('/password/update', isAuthenticated, updatePassword);

router.put("/profile/update", isAuthenticated, updateProfile);


export default router;