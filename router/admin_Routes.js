import express from 'express';
import { getAllUsers, deleteUser, dashboardStats } from '../controllers/adminController.js';
import { isAuthenticated, authorizedRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/getAllUsers', isAuthenticated, authorizedRoles('admin'), getAllUsers);

router.delete('/deleteUser/:id', isAuthenticated, authorizedRoles('admin'), deleteUser);

router.get('/fetch/dashboard-stats', isAuthenticated, authorizedRoles('admin'), dashboardStats);

export default router;