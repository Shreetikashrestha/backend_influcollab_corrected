import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { AuthController } from "../controllers/auth.controller";
import { upload } from "../middleware/upload.middleware";
import { authorizedMiddleware } from "../middleware/authorization.middleware";
const router = Router();

const userController = new UserController();
const authController = new AuthController();

router.get('/influencers', userController.getInfluencers);

router.put('/update', authorizedMiddleware, upload.single('profilePicture'), userController.updateProfile);

router.get('/search-messaging', authorizedMiddleware, userController.searchUsersForMessaging);

router.get('/admin/all', userController.getAllUsers);
router.post('/admin', authorizedMiddleware, upload.single('profilePicture'), userController.createUser);
router.get('/admin/stats', authorizedMiddleware, userController.getAdminStats);
router.post('/admin/invite', authorizedMiddleware, userController.sendInvitation);
router.put('/admin/:id', userController.updateUser);
router.delete('/admin/:id', userController.deleteUser);

router.get('/:id', userController.getUserById);

export default router;
