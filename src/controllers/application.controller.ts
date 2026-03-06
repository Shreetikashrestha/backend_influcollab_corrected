import { Request, Response } from "express";
import mongoose from "mongoose";
import { ApplicationModel } from "../models/application.model";
import { CampaignModel } from "../models/campaign.model";
import { UserModel } from "../models/user.model";

export class ApplicationController {
    async createApplication(req: Request, res: Response) {
        try {
            const userId = (req as any).user._id;
            const { campaignId, message } = req.body;

            if (!campaignId) {
                return res.status(400).json({
                    success: false,
                    message: "Campaign ID is required"
                });
            }

            const campaign = await CampaignModel.findById(campaignId);
            if (!campaign) {
                return res.status(404).json({
                    success: false,
                    message: "Campaign not found"
                });
            }

            const existingApplication = await ApplicationModel.findOne({
                influencerId: userId,
                campaignId: campaignId
            });

            if (existingApplication) {
                return res.status(400).json({
                    success: false,
                    message: "You have already applied to this campaign"
                });
            }

            const application = await ApplicationModel.create({
                influencerId: userId,
                campaignId: campaignId,
                brandId: campaign.creatorId,
                proposalMessage: message || "",
                status: 'pending',
            });

            await CampaignModel.findByIdAndUpdate(
                campaignId,
                { $inc: { applicantsCount: 1 } }
            );

            return res.status(201).json({
                success: true,
                message: "Application submitted successfully",
                data: application,
            });
        } catch (error: any) {
            console.error('Error creating application:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to create application"
            });
        }
    }

    async getCampaignApplications(req: Request, res: Response) {
        try {
            const userId = (req as any).user._id;
            const { campaignId } = req.params;
            const { status } = req.query;

            const campaign = await CampaignModel.findById(campaignId);
            if (!campaign) {
                return res.status(404).json({
                    success: false,
                    message: "Campaign not found"
                });
            }

            if (campaign.creatorId.toString() !== userId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "You don't have permission to view these applications"
                });
            }

            const filter: any = { campaignId };
            if (status) {
                filter.status = status;
            }

            const applications = await ApplicationModel.find(filter)
                .populate('influencerId', 'fullName email isInfluencer profilePicture')
                .populate('campaignId', 'title brandName category budgetMin budgetMax')
                .sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                data: applications,
            });
        } catch (error: any) {
            console.error('Error fetching campaign applications:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch applications"
            });
        }
    }

    async getInfluencerApplications(req: Request, res: Response) {
        try {
            const userId = (req as any).user._id;
            const { status } = req.query;

            const filter: any = { influencerId: userId };
            if (status) {
                filter.status = status;
            }

            const applications = await ApplicationModel.find(filter)
                .populate('campaignId', 'title brandName category budgetMin budgetMax deadline status')
                .populate('brandId', 'fullName email')
                .sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                data: applications,
            });
        } catch (error: any) {
            console.error('Error fetching influencer applications:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch applications"
            });
        }
    }

    async updateApplicationStatus(req: Request, res: Response) {
        try {
            const user = (req as any).user;
            const userId = user._id;
            const { id: applicationId } = req.params;
            const { status } = req.body;

            console.log('=== updateApplicationStatus Debug ===');
            console.log('Full user object:', user);
            console.log('User ID from token:', userId);
            console.log('User ID type:', typeof userId, userId.constructor.name);
            console.log('Application ID:', applicationId);
            console.log('New status:', status);

            if (!status || !['accepted', 'rejected'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid status. Must be 'accepted' or 'rejected'"
                });
            }

            const application = await ApplicationModel.findById(applicationId);
            if (!application) {
                console.log('Application not found');
                return res.status(404).json({
                    success: false,
                    message: "Application not found"
                });
            }

            console.log('Application found:', {
                _id: application._id,
                brandId: application.brandId,
                brandIdType: typeof application.brandId,
                currentStatus: application.status
            });

            const brandIdStr = application.brandId.toString();
            const userIdStr = userId.toString();

            console.log('Permission check:', {
                brandIdStr,
                userIdStr,
                matches: brandIdStr === userIdStr,
                areEqual: brandIdStr === userIdStr
            });

            if (brandIdStr !== userIdStr) {
                console.log('❌ Permission denied - IDs do not match');
                return res.status(403).json({
                    success: false,
                    message: "You don't have permission to update this application"
                });
            }

            console.log('✅ Permission granted, updating status');

            application.status = status as 'accepted' | 'rejected';
            await application.save();

            await application.populate('influencerId', 'fullName email');
            await application.populate('campaignId', 'title');

            console.log('✅ Status updated successfully');

            return res.status(200).json({
                success: true,
                message: `Application ${status} successfully`,
                data: application,
            });
        } catch (error: any) {
            console.error('Error updating application status:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to update application status"
            });
        }
    }

    async getApplicationById(req: Request, res: Response) {
        try {
            const user = (req as any).user;
            const userId = user._id;
            const { id: applicationId } = req.params;

            console.log('=== getApplicationById Debug ===');
            console.log('Full user object:', user);
            console.log('User ID from token:', userId);
            console.log('User ID type:', typeof userId, userId.constructor.name);
            console.log('Application ID requested:', applicationId);

            const application = await ApplicationModel.findById(applicationId)
                .populate('influencerId', 'fullName email isInfluencer profilePicture bio')
                .populate('campaignId', 'title brandName category budgetMin budgetMax deadline')
                .populate('brandId', 'fullName email');

            if (!application) {
                console.log('Application not found');
                return res.status(404).json({
                    success: false,
                    message: "Application not found"
                });
            }

            console.log('Application found (raw):', {
                _id: application._id,
                brandId: application.brandId,
                brandIdType: typeof application.brandId,
                brandIdConstructor: application.brandId?.constructor?.name,
                influencerId: application.influencerId,
                influencerIdType: typeof application.influencerId,
                status: application.status
            });

            const brandIdStr = (application.brandId as any)?._id 
                ? (application.brandId as any)._id.toString() 
                : application.brandId.toString();
            
            const influencerIdStr = (application.influencerId as any)?._id 
                ? (application.influencerId as any)._id.toString() 
                : application.influencerId.toString();

            const userIdStr = userId.toString();

            console.log('Permission check:', {
                userIdStr,
                brandIdStr,
                influencerIdStr,
                isBrand: brandIdStr === userIdStr,
                isInfluencer: influencerIdStr === userIdStr
            });

            const isBrand = brandIdStr === userIdStr;
            const isInfluencer = influencerIdStr === userIdStr;

            if (!isBrand && !isInfluencer) {
                console.log('❌ Permission denied - User is neither brand nor influencer for this application');
                return res.status(403).json({
                    success: false,
                    message: "You don't have permission to view this application"
                });
            }

            console.log('✅ Permission granted');
            return res.status(200).json({
                success: true,
                application: application,
            });
        } catch (error: any) {
            console.error('Error fetching application:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch application"
            });
        }
    }

    async getInfluencerStats(req: Request, res: Response) {
        try {
            const userId = (req as any).user._id;

            const stats = await ApplicationModel.aggregate([
                { $match: { influencerId: new mongoose.Types.ObjectId(userId) } },
                {
                    $group: {
                        _id: null,
                        totalApplications: { $sum: 1 },
                        activeCampaigns: {
                            $sum: {
                                $cond: [{ $in: ["$status", ["accepted", "pending"]] }, 1, 0]
                            }
                        },
                        completedCampaigns: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] // logic for completed
                            }
                        }
                    }
                }
            ]);

            const result = stats.length > 0 ? stats[0] : {
                totalApplications: 0,
                activeCampaigns: 0,
                completedCampaigns: 0
            };

            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error: any) {
            console.error('Error fetching influencer stats:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch stats"
            });
        }
    }
}
