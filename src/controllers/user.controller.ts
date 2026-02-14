import { Request, Response } from "express";
import { UserModel } from "../models/user.model";
import { UserService } from "../services/user.service";

let userService = new UserService();

export class UserController {
    // Get all influencers
    async getInfluencers(req: Request, res: Response) {
        try {
            const { search, page, limit } = req.query;
            let query: any = { isInfluencer: true };

            if (search) {
                query.$or = [
                    { fullName: { $regex: search, $options: 'i' } },
                    { bio: { $regex: search, $options: 'i' } },
                    { 'contentCategories': { $regex: search, $options: 'i' } }
                ];
            }

            const p = parseInt(page as string) || 1;
            const l = parseInt(limit as string) || 10;
            const skip = (p - 1) * l;

            const total = await UserModel.countDocuments(query);
            const influencers = await UserModel.find(query)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(l);

            return res.status(200).json({
                success: true,
                count: influencers.length,
                total,
                page: p,
                limit: l,
                data: influencers,
            });
        } catch (error: any) {
            console.error('Error fetching influencers:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch influencers"
            });
        }
    }

    // Get user by ID (Public profile view)
    async getUserById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const user = await UserModel.findById(id).select('-password');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            return res.status(200).json({
                success: true,
                data: user,
            });
        } catch (error: any) {
            console.error('Error fetching user:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch user"
            });
        }
    }

    // Admin: Get all users with pagination
    async getAllUsers(req: Request, res: Response) {
        try {
            const { page, limit, search } = req.query;
            const p = parseInt(page as string) || 1;
            const l = parseInt(limit as string) || 10;

            const result = await userService.getAllUsers(p, l);

            return res.status(200).json({
                success: true,
                ...result
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Failed to fetch users"
            });
        }
    }

    // Admin: Update user
    async updateUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updatedUser = await userService.updateUser(id as string, req.body);
            return res.status(200).json({
                success: true,
                data: updatedUser,
                message: "User updated successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Failed to update user"
            });
        }
    }

    // Admin: Delete user
    async deleteUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await userService.deleteUser(id as string);
            return res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Failed to delete user"
            });
        }
    }
}
