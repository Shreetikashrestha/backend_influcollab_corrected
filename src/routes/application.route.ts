import { Router } from "express";
import { ApplicationController } from "../controllers/application.controller";
import { authorizedMiddleware } from "../middleware/authorization.middleware";

const applicationController = new ApplicationController();
const router = Router();

// All routes require authentication
router.use(authorizedMiddleware);

// Influencer routes
router.get('/stats/influencer', applicationController.getInfluencerStats);
router.post('/', applicationController.createApplication);
router.get('/my', applicationController.getInfluencerApplications);

// Brand routes
router.get('/campaign/:campaignId', applicationController.getCampaignApplications);
router.patch('/:id/status', applicationController.updateApplicationStatus);

// Get single application (both brand and influencer can access)
router.get('/:id', applicationController.getApplicationById);

export default router;
