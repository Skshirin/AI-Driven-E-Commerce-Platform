import express from 'express';
import { login, register, logout, getUser } from '../controllers/authController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login', login);

router.post('/register', register);

router.get('/logout', isAuthenticated, logout);

router.get('/me', isAuthenticated, getUser);


export default router;