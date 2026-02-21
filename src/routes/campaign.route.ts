import { Router } from "express";
import { CampaignController } from "../controllers/campaign.controller";
import { authorizedMiddleware } from "../middleware/authorization.middleware";

const campaignController = new CampaignController();
const router = Router();

// Public routes (accessible to authenticated users)
router.get('/', authorizedMiddleware, campaignController.getCampaigns);
router.get('/my', authorizedMiddleware, campaignController.getUserCampaigns);
router.get('/brand-stats', authorizedMiddleware, campaignController.getBrandStats);
router.get('/:id', authorizedMiddleware, campaignController.getCampaignById);

// Brand routes
router.post('/', authorizedMiddleware, campaignController.createCampaign);
router.put('/:id', authorizedMiddleware, campaignController.updateCampaign);
router.patch('/:id', authorizedMiddleware, campaignController.updateCampaign);

// Influencer routes
router.post('/:id/join', authorizedMiddleware, campaignController.joinCampaign);

export default router;
