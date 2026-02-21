import express from 'express';
import { getAllUsers, deleteUser } from '../controllers/admin_Controller.js';
import { isAuthenticated, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/users', isAuthenticated, authorizeRoles('admin'), getAllUsers);

export default router;