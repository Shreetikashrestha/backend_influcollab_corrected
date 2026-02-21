import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { AuthController } from "../controllers/auth.controller";
import { upload } from "../middleware/upload.middleware";
import { authorizedMiddleware } from "../middleware/authorization.middleware";
const router = Router();

// router.use(authorizedMiddleware);

const userController = new UserController();
const authController = new AuthController();

// Auth related (Moved to auth.route.ts)

// Get all influencers (public or protected as needed)
router.get('/influencers', userController.getInfluencers);

// Update user profile (Self)
router.put('/update', authorizedMiddleware, upload.single('profilePicture'), userController.updateProfile);

// Search users for messaging
router.get('/search-messaging', authorizedMiddleware, userController.searchUsersForMessaging);

// Admin routes
router.get('/admin/all', userController.getAllUsers);
router.put('/admin/:id', userController.updateUser);
router.delete('/admin/:id', userController.deleteUser);

// Get user profile by ID
router.get('/:id', userController.getUserById);

export default router;
