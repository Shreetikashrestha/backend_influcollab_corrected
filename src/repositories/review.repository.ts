import Review from '../models/review.model';
import { IReview } from '../types/review.type';

export class ReviewRepository {
    async create(reviewData: Partial<IReview>): Promise<IReview> {
        const review = new Review(reviewData);
        return await review.save();
    }

    async findById(id: string): Promise<IReview | null> {
        return await Review.findById(id)
            .populate('reviewerId')
            .populate('revieweeId');
    }

    async findByRevieweeId(revieweeId: string): Promise<IReview[]> {
        return await Review.find({ revieweeId })
            .populate('reviewerId')
            .sort({ createdAt: -1 });
    }

    async findByReviewerId(reviewerId: string): Promise<IReview[]> {
        return await Review.find({ reviewerId })
            .populate('revieweeId')
            .sort({ createdAt: -1 });
    }

    async update(id: string, updateData: Partial<IReview>): Promise<IReview | null> {
        return await Review.findByIdAndUpdate(id, updateData, { new: true });
    }

    async delete(id: string): Promise<IReview | null> {
        return await Review.findByIdAndDelete(id);
    }

    async getAverageRating(revieweeId: string): Promise<number> {
        const result = await Review.aggregate([
            { $match: { revieweeId } },
            { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]);
        return result.length > 0 ? result[0].avgRating : 0;
    }
}

export default new ReviewRepository();
