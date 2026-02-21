import { Request, Response } from "express";
import mongoose from "mongoose";
import { CampaignModel } from "../models/campaign.model";
import { ApplicationModel } from "../models/application.model";
import { NotificationModel } from "../models/notification.model";

export class CampaignController {
    // Create a new campaign (Brand only)
    async createCampaign(req: Request, res: Response) {
        try {
            const userId = (req as any).user._id; // Set by auth middleware

            const {
                title,
                description,
                brandName,
                category,
                budgetMin,
                budgetMax,
                deadline,
                location,
                requirements,
                deliverables,
            } = req.body;

            // Validate required fields
            if (!title || !description || !brandName || !category || !budgetMin || !budgetMax || !deadline || !location) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required fields"
                });
            }

            const campaign = await CampaignModel.create({
                title,
                description,
                brandName,
                category,
                budgetMin,
                budgetMax,
                deadline,
                location,
                requirements: requirements || [],
                deliverables: deliverables || [],
                creatorId: userId,
                status: 'active',
            });

            return res.status(201).json({
                success: true,
                message: "Campaign created successfully",
                data: campaign,
            });
        } catch (error: any) {
            console.error('Error creating campaign:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to create campaign"
            });
        }
    }

    // Get all campaigns (with optional status filter and pagination)
    async getCampaigns(req: Request, res: Response) {
        try {
            const { status, page, limit, search } = req.query;
            const filter: any = {};

            if (status) {
                filter.status = status;
            }

            // Add search functionality
            if (search) {
                filter.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { brandName: { $regex: search, $options: 'i' } },
                    { category: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }

            // Pagination
            const p = parseInt(page as string) || 1;
            const l = parseInt(limit as string) || 10;
            const skip = (p - 1) * l;

            const total = await CampaignModel.countDocuments(filter);
            const campaigns = await CampaignModel.find(filter)
                .populate('creatorId', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(l);

            return res.status(200).json({
                success: true,
                campaigns: campaigns,
                total: total,
                page: p,
                limit: l,
                data: campaigns, // Keep for backward compatibility
            });
        } catch (error: any) {
            console.error('Error fetching campaigns:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch campaigns"
            });
        }
    }

    // Get a single campaign by ID
    async getCampaignById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const campaign = await CampaignModel.findById(id)
                .populate('creatorId', 'fullName email');

            if (!campaign) {
                return res.status(404).json({
                    success: false,
                    message: "Campaign not found"
                });
            }

            return res.status(200).json({
                success: true,
                data: campaign,
            });
        } catch (error: any) {
            console.error('Error fetching campaign:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch campaign"
            });
        }
    }

    // Get campaigns created by the logged-in user (Brand's campaigns)
    async getUserCampaigns(req: Request, res: Response) {
        try {
            const userId = (req as any).user._id;

            const campaigns = await CampaignModel.find({ creatorId: userId })
                .sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                data: campaigns,
            });
        } catch (error: any) {
            console.error('Error fetching user campaigns:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch campaigns"
            });
        }
    }

    // Apply to campaign (Join campaign) - Influencer only
    async joinCampaign(req: Request, res: Response) {
        try {
            const userId = (req as any).user._id;
            const { id: campaignId } = req.params;
            const { message } = req.body;

            // Check if campaign exists
            const campaign = await CampaignModel.findById(campaignId);
            if (!campaign) {
                return res.status(404).json({
                    success: false,
                    message: "Campaign not found"
                });
            }

            // Check if user already applied
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

            // Create application
            const application = await ApplicationModel.create({
                influencerId: userId,
                campaignId: campaignId,
                brandId: campaign.creatorId,
                proposalMessage: message || "",
                status: 'pending',
            });

            // Create notification for brand
            try {
                const influencer = (req as any).user;
                await NotificationModel.create({
                    userId: campaign.creatorId,
                    userRole: 'brand',
                    type: 'application',
                    title: 'New Application Received',
                    message: `${influencer.fullName || 'An influencer'} has applied to your campaign "${campaign.title}"`,
                    icon: 'megaphone',
                    iconColor: 'purple',
                    link: '/brand/applications', // Adjust based on your actual brand applications route
                    metadata: {
                        campaignId: campaignId.toString(),
                        applicationId: application._id.toString(),
                        userId: userId.toString()
                    },
                    priority: 'medium'
                });
            } catch (notifError) {
                console.error('Failed to create notification:', notifError);
                // Don't fail the whole request if notification fails
            }

            // Increment applicants count
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
            console.error('Error applying to campaign:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to apply to campaign"
            });
        }
    }

    // Update an existing campaign (Brand only)
    async updateCampaign(req: Request, res: Response) {
        try {
            const userId = (req as any).user._id;
            const { id } = req.params;

            const campaign = await CampaignModel.findById(id);

            if (!campaign) {
                return res.status(404).json({
                    success: false,
                    message: "Campaign not found"
                });
            }

            // Check ownership
            if (campaign.creatorId.toString() !== userId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to update this campaign"
                });
            }

            const updatedCampaign = await CampaignModel.findByIdAndUpdate(
                id,
                { $set: req.body },
                { new: true, runValidators: true }
            );

            return res.status(200).json({
                success: true,
                message: "Campaign updated successfully",
                data: updatedCampaign,
            });
        } catch (error: any) {
            console.error('Error updating campaign:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to update campaign"
            });
        }
    }

    // Get aggregated stats for the logged-in brand
    async getBrandStats(req: Request, res: Response) {
        try {
            const userId = (req as any).user._id;

            const campaigns = await CampaignModel.find({ creatorId: userId }).lean();

            const totalCampaigns = campaigns.length;
            const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
            const totalBudgetAllocated = campaigns.reduce((sum, c) => sum + (c.budgetMax || 0), 0);
            const totalApplicants = campaigns.reduce((sum, c) => sum + (c.applicantsCount || 0), 0);

            // Count accepted applications (unique influencers)
            const campaignIds = campaigns.map(c => c._id);
            const acceptedCount = await ApplicationModel.countDocuments({
                campaignId: { $in: campaignIds },
                status: 'accepted'
            });

            // Group campaigns by category
            const categoryMap: Record<string, number> = {};
            for (const c of campaigns) {
                const cat = c.category || 'General';
                categoryMap[cat] = (categoryMap[cat] || 0) + 1;
            }
            const campaignsByCategory = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

            // Per-campaign data for chart and table (most recent 7)
            const recentCampaigns = campaigns
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 7)
                .map(c => ({
                    _id: c._id,
                    title: c.title,
                    status: c.status,
                    budgetMax: c.budgetMax || 0,
                    budgetMin: c.budgetMin || 0,
                    applicantsCount: c.applicantsCount || 0,
                    category: c.category,
                    createdAt: c.createdAt,
                }))
                .reverse(); // ascending for chart

            return res.status(200).json({
                success: true,
                data: {
                    totalCampaigns,
                    activeCampaigns,
                    totalBudgetAllocated,
                    totalApplicants,
                    acceptedInfluencers: acceptedCount,
                    campaignsByCategory,
                    recentCampaigns,
                }
            });
        } catch (error: any) {
            console.error('Error fetching brand stats:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch brand stats"
            });
        }
    }
}
