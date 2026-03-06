import { Router } from "express";
import { CampaignController } from "../controllers/campaign.controller";
import { authorizedMiddleware } from "../middleware/authorization.middleware";

const campaignController = new CampaignController();
const router = Router();

router.get('/', authorizedMiddleware, campaignController.getCampaigns);
router.get('/my', authorizedMiddleware, campaignController.getUserCampaigns);
router.get('/my-campaigns', authorizedMiddleware, campaignController.getUserCampaigns);
router.get('/brand-stats', authorizedMiddleware, campaignController.getBrandStats);
router.get('/:id', authorizedMiddleware, campaignController.getCampaignById);

router.post('/', authorizedMiddleware, campaignController.createCampaign);
router.put('/:id', authorizedMiddleware, campaignController.updateCampaign);
router.patch('/:id', authorizedMiddleware, campaignController.updateCampaign);

router.post('/:id/join', authorizedMiddleware, campaignController.joinCampaign);

export default router;
