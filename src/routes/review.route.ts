import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { authorizedMiddleware } from "../middleware/authorization.middleware";

const reviewController = new ReviewController();
const router = Router();

router.post('/', authorizedMiddleware, reviewController.createReview);

router.get('/:userId', reviewController.getReviews);

export default router;
