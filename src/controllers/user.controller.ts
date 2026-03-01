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

    // Admin: Create new user
    async createUser(req: Request, res: Response) {
        try {
            const { email, password, fullName, isInfluencer, role, bio, gender } = req.body;

            // Validate required fields
            if (!email || !password || !fullName) {
                return res.status(400).json({
                    success: false,
                    message: "Email, password, and full name are required"
                });
            }

            // Check if user already exists
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "User with this email already exists"
                });
            }

            // Hash password
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user data
            const userData: any = {
                email,
                password: hashedPassword,
                fullName,
                isInfluencer: isInfluencer === 'true' || isInfluencer === true,
                role: role || 'user',
            };

            if (bio) userData.bio = bio;
            if (gender) userData.gender = gender;
            if (req.file) {
                userData.profilePicture = `/uploads/${req.file.filename}`;
            }

            // Create user
            const newUser = await UserModel.create(userData);

            // Remove password from response
            const { password: _, ...userResponse } = newUser.toObject();

            return res.status(201).json({
                success: true,
                data: userResponse,
                message: "User created successfully"
            });
        } catch (error: any) {
            console.error('Error creating user:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to create user"
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

    // Update Profile (Self)
    async updateProfile(req: any, res: Response) {
        try {
            const userId = req.user._id;
            const updateData = { ...req.body };

            if (req.file) {
                updateData.profilePicture = `/uploads/${req.file.filename}`;
            }

            const updatedUser = await userService.updateUser(userId, updateData);

            return res.status(200).json({
                success: true,
                data: updatedUser,
                message: "Profile updated successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Failed to update profile"
            });
        }
    }

    // Search users for messaging
    async searchUsersForMessaging(req: any, res: Response) {
        try {
            const { q } = req.query;
            const currentUserId = req.user._id;

            if (!q || q.length < 2) {
                return res.status(200).json({ success: true, data: [] });
            }

            const users = await UserModel.find({
                _id: { $ne: currentUserId },
                $or: [
                    { fullName: { $regex: q, $options: 'i' } },
                    { email: { $regex: q, $options: 'i' } }
                ]
            })
                .select('fullName email profilePicture isInfluencer role')
                .limit(10);

            return res.status(200).json({
                success: true,
                data: users
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to search users"
            });
        }
    }


    // Admin: Get platform statistics
    async getAdminStats(req: Request, res: Response) {
        try {
            const [
                totalUsers,
                influencers,
                brands,
                admins,
                usersThisMonth,
                usersLastMonth
            ] = await Promise.all([
                UserModel.countDocuments(),
                UserModel.countDocuments({ isInfluencer: true }),
                UserModel.countDocuments({ isInfluencer: false, role: { $ne: 'admin' } }),
                UserModel.countDocuments({ role: 'admin' }),
                UserModel.countDocuments({
                    createdAt: {
                        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }),
                UserModel.countDocuments({
                    createdAt: {
                        $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
                        $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                })
            ]);

            // Calculate growth percentage
            const userGrowth = usersLastMonth > 0
                ? ((usersThisMonth - usersLastMonth) / usersLastMonth * 100).toFixed(1)
                : '0';

            // Get monthly user registration data for the current year
            const currentYear = new Date().getFullYear();
            const monthlyData = await UserModel.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(currentYear, 0, 1),
                            $lt: new Date(currentYear + 1, 0, 1)
                        }
                    }
                },
                {
                    $group: {
                        _id: { $month: '$createdAt' },
                        count: { $sum: 1 },
                        influencers: {
                            $sum: { $cond: ['$isInfluencer', 1, 0] }
                        },
                        brands: {
                            $sum: { $cond: [{ $and: [{ $eq: ['$isInfluencer', false] }, { $ne: ['$role', 'admin'] }] }, 1, 0] }
                        }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]);

            // Format monthly data
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const formattedMonthlyData = months.map((month, index) => {
                const data = monthlyData.find(d => d._id === index + 1);
                return {
                    name: month,
                    influencers: data?.influencers || 0,
                    brands: data?.brands || 0,
                    total: data?.count || 0
                };
            });

            return res.status(200).json({
                success: true,
                data: {
                    totalUsers,
                    influencers,
                    brands,
                    admins,
                    userGrowth: `+${userGrowth}%`,
                    monthlyData: formattedMonthlyData
                }
            });
        } catch (error: any) {
            console.error('Error fetching admin stats:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch admin statistics"
            });
        }
    }

    // Send invitation email
    async sendInvitation(req: Request, res: Response) {
        try {
            const { email, inviterName } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: "Email is required"
                });
            }

            // Check if user already exists
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "User with this email already exists"
                });
            }

            const { EmailService } = await import('../services/email.service');
            const emailService = new EmailService();
            
            const registerUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register`;
            const senderName = inviterName || 'Admin';
            
            const result = await emailService.sendInvitationEmail(email, senderName, registerUrl);

            return res.status(200).json({
                success: true,
                message: "Invitation email sent successfully",
                previewUrl: result.previewUrl
            });
        } catch (error: any) {
            console.error('Error sending invitation:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to send invitation email"
            });
        }
    }

}
