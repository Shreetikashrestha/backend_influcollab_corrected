import { Request, Response } from "express";
import { ReviewModel } from "../models/review.model";
import { InfluencerProfileModel } from "../models/influencer_profile.model";

export class ReviewController {
    async createReview(req: Request, res: Response) {
        try {
            const reviewerId = (req as any).user._id;
            const { revieweeId, campaignId, rating, comment } = req.body;

            if (!revieweeId || !campaignId || !rating) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required fields"
                });
            }

            const review = await ReviewModel.create({
                reviewerId,
                revieweeId,
                campaignId,
                rating,
                comment
            });

            const stats = await ReviewModel.aggregate([
                { $match: { revieweeId: review.revieweeId } },
                {
                    $group: {
                        _id: "$revieweeId",
                        avgRating: { $avg: "$rating" },
                        count: { $sum: 1 }
                    }
                }
            ]);

            if (stats.length > 0) {
                await InfluencerProfileModel.findOneAndUpdate(
                    { userId: revieweeId },
                    {
                        avgRating: parseFloat(stats[0].avgRating.toFixed(1)),
                        reviewCount: stats[0].count
                    }
                );
            }

            return res.status(201).json({
                success: true,
                message: "Review submitted successfully",
                data: review
            });
        } catch (error: any) {
            console.error("Create Review Error:", error);
            if (error.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: "You have already reviewed this campaign"
                });
            }
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to submit review"
            });
        }
    }

    async getReviews(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const { page, limit } = req.query;

            const p = parseInt(page as string) || 1;
            const l = parseInt(limit as string) || 10;
            const skip = (p - 1) * l;

            const reviews = await ReviewModel.find({ revieweeId: userId })
                .populate('reviewerId', 'fullName profilePicture')
                .populate('campaignId', 'title')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(l);

            const total = await ReviewModel.countDocuments({ revieweeId: userId });

            return res.status(200).json({
                success: true,
                data: reviews,
                pagination: {
                    page: p,
                    limit: l,
                    total,
                    pages: Math.ceil(total / l)
                }
            });
        } catch (error: any) {
            console.error("Get Reviews Error:", error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch reviews"
            });
        }
    }
}
