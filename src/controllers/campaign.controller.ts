import { Request, Response } from "express";
import { CampaignModel } from "../models/campaign.model";
import { ApplicationModel } from "../models/application.model";

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

    // Get all campaigns (with optional status filter)
    async getCampaigns(req: Request, res: Response) {
        try {
            const { status } = req.query;
            const filter: any = {};

            if (status) {
                filter.status = status;
            }

            const campaigns = await CampaignModel.find(filter)
                .populate('creatorId', 'fullName email')
                .sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                data: campaigns,
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
}
