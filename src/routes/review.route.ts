import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { authorizedMiddleware } from "../middleware/authorization.middleware";

const reviewController = new ReviewController();
const router = Router();

// Create review (Protected)
router.post('/', authorizedMiddleware, reviewController.createReview);

// Get reviews (Public or Protected depending on requirements, making it public for profile view)
router.get('/:userId', reviewController.getReviews);

export default router;
