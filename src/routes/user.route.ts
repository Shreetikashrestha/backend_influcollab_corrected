import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { AuthController } from "../controllers/auth.controller";
// import { authorizedMiddleware } from "../../middleware/authorization.middleware";
const router = Router();

// router.use(authorizedMiddleware);

const userController = new UserController();
const authController = new AuthController();

// Auth related (Moved to auth.route.ts)

// Get all influencers (public or protected as needed)
router.get('/influencers', userController.getInfluencers);

// Admin routes
router.get('/admin/all', userController.getAllUsers);
router.put('/admin/:id', userController.updateUser);
router.delete('/admin/:id', userController.deleteUser);

// Get user profile by ID
router.get('/:id', userController.getUserById);

export default router;
