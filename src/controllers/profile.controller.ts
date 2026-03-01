import { Request, Response } from 'express';
import { InfluencerProfileModel } from '../models/influencer_profile.model';
import { BrandProfileModel } from '../models/brand_profile.model';
import { UserModel } from '../models/user.model';

export const ProfileController = {
    // Get current user's profile
    getMyProfile: async (req: any, res: Response) => {
        try {
            let profile;
            if (req.user.isInfluencer) {
                // Atomic upsert to prevent race conditions (duplicate key errors)
                profile = await InfluencerProfileModel.findOneAndUpdate(
                    { userId: req.user._id },
                    {
                        $setOnInsert: {
                            userId: req.user._id,
                            username: req.user.email.split('@')[0], // Default username
                            isVerified: false
                        }
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
            } else {
                profile = await BrandProfileModel.findOneAndUpdate(
                    { userId: req.user._id },
                    {
                        $setOnInsert: {
                            userId: req.user._id,
                            companyName: req.user.fullName,
                            isVerified: false
                        }
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
            }

            res.status(200).json({ success: true, profile, user: req.user });
        } catch (error: any) {
            console.error("Profile Fetch Error:", error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Get profile by userId
    getProfileByUserId: async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            const user = await UserModel.findById(userId).select('-password');

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            let profile;
            if (user.isInfluencer) {
                profile = await InfluencerProfileModel.findOne({ userId });
            } else {
                profile = await BrandProfileModel.findOne({ userId });
            }

            res.status(200).json({ success: true, profile, user });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Update profile
    updateProfile: async (req: any, res: Response) => {
        try {
            // If a logo file was uploaded, add its URL to the body
            const updateData = { ...req.body };
            if (req.file) {
                updateData.logo = `/uploads/${req.file.filename}`;
            }

            let profile;
            if (req.user.isInfluencer) {
                profile = await InfluencerProfileModel.findOneAndUpdate(
                    { userId: req.user._id },
                    { $set: updateData },
                    { new: true, runValidators: true }
                );
            } else {
                profile = await BrandProfileModel.findOneAndUpdate(
                    { userId: req.user._id },
                    { $set: updateData },
                    { new: true, runValidators: true }
                );
            }

            res.status(200).json({ success: true, profile });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Get all influencers with filtering
    getAllInfluencers: async (req: Request, res: Response) => {
        try {
            const { niche, category, search } = req.query;
            let query: any = {};

            if (niche) {
                query.niches = { $in: [niche] };
            }

            if (category) {
                query.categories = { $in: [category] };
            }

            // If search is provided, we might want to search by username or join with user model
            // For now, let's search by username in the InfluencerProfile
            if (search) {
                query.username = { $regex: search, $options: 'i' };
            }

            const influencers = await InfluencerProfileModel.find(query)
                .populate('userId', 'fullName profilePicture email')
                .sort({ createdAt: -1 });

            res.status(200).json({ success: true, count: influencers.length, data: influencers });
        } catch (error: any) {
            console.error("Fetch Influencers Error:", error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
