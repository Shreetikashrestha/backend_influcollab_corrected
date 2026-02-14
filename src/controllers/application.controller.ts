import { Request, Response } from "express";
import { ApplicationModel } from "../models/application.model";
import { CampaignModel } from "../models/campaign.model";
import { UserModel } from "../models/user.model";

export class ApplicationController {
    // Create application (alternative to joinCampaign)
    async createApplication(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;
            const { campaignId, message } = req.body;

            if (!campaignId) {
                return res.status(400).json({
                    success: false,
                    message: "Campaign ID is required"
                });
            }

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
            console.error('Error creating application:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to create application"
            });
        }
    }

    // Get applications for a specific campaign (Brand only)
    async getCampaignApplications(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;
            const { campaignId } = req.params;
            const { status } = req.query;

            // Verify campaign exists and belongs to the user
            const campaign = await CampaignModel.findById(campaignId);
            if (!campaign) {
                return res.status(404).json({
                    success: false,
                    message: "Campaign not found"
                });
            }

            if (campaign.creatorId.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: "You don't have permission to view these applications"
                });
            }

            // Build filter
            const filter: any = { campaignId };
            if (status) {
                filter.status = status;
            }

            // Get applications with influencer details
            const applications = await ApplicationModel.find(filter)
                .populate('influencerId', 'fullName email isInfluencer')
                .populate('campaignId', 'title brandName category budgetMin budgetMax')
                .sort({ appliedAt: -1 });

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

    // Get applications submitted by the logged-in influencer
    async getInfluencerApplications(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;
            const { status } = req.query;

            const filter: any = { influencerId: userId };
            if (status) {
                filter.status = status;
            }

            const applications = await ApplicationModel.find(filter)
                .populate('campaignId', 'title brandName category budgetMin budgetMax deadline status')
                .populate('brandId', 'fullName email')
                .sort({ appliedAt: -1 });

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

    // Update application status (Brand only - Accept/Reject)
    async updateApplicationStatus(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;
            const { id: applicationId } = req.params;
            const { status } = req.body;

            // Validate status
            if (!status || !['accepted', 'rejected'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid status. Must be 'accepted' or 'rejected'"
                });
            }

            // Get application
            const application = await ApplicationModel.findById(applicationId);
            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: "Application not found"
                });
            }

            // Verify the brand owns this application
            if (application.brandId.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: "You don't have permission to update this application"
                });
            }

            // Update status
            application.status = status as 'accepted' | 'rejected';
            await application.save();

            // Populate for response
            await application.populate('influencerId', 'fullName email');
            await application.populate('campaignId', 'title');

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
}
