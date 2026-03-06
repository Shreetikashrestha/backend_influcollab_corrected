import { Router } from "express";
import { ApplicationController } from "../controllers/application.controller";
import { authorizedMiddleware } from "../middleware/authorization.middleware";

const applicationController = new ApplicationController();
const router = Router();

router.use(authorizedMiddleware);

router.get('/stats/influencer', applicationController.getInfluencerStats);
router.post('/', applicationController.createApplication);
router.get('/my', applicationController.getInfluencerApplications);
router.get('/my-applications', applicationController.getInfluencerApplications);

router.get('/campaign/:campaignId', applicationController.getCampaignApplications);
router.patch('/:id/status', applicationController.updateApplicationStatus);

router.get('/:id', applicationController.getApplicationById);

export default router;
