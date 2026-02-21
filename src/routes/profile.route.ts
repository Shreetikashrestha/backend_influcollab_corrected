import express from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authorizedMiddleware } from '../middleware/authorization.middleware';
import { upload } from '../middleware/upload.middleware';

const router = express.Router();

router.get('/me', authorizedMiddleware, ProfileController.getMyProfile);
router.get('/influencers', authorizedMiddleware, ProfileController.getAllInfluencers);
router.get('/:userId', authorizedMiddleware, ProfileController.getProfileByUserId);

// Support optional logo/profilePicture upload on profile update
router.patch('/update', authorizedMiddleware, upload.single('logo'), ProfileController.updateProfile);

export default router;
