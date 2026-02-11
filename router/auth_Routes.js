import express from 'express';
import { login, register, logout, getUser, forgotPassword } from '../controllers/authController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login', login);

router.post('/register', register);

router.get('/logout', isAuthenticated, logout);

router.get('/me', isAuthenticated, getUser);

router.post('/password/forgot', forgotPassword);

export default router;