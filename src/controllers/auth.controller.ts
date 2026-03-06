import z from "zod";
import { Request, Response } from "express";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { UserService } from "../services/user.service";
import { EmailService } from "../services/email.service";
import { HttpError } from "../errors/http-error";
import { FRONTEND_URL } from "../config/index";

let userService = new UserService();

export class AuthController {
    async register(req: Request, res: Response) {
        try {
            const parsedData = CreateUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedData.error)
                });
            }
            const newUser = await userService.registerUser(parsedData.data);

            const userResponse = {
                userId: newUser?._id ?? "",
                email: newUser?.email ?? "",
                fullName: newUser?.fullName ?? "",
                isInfluencer: newUser?.isInfluencer ?? false,
                role: newUser?.role ?? "user",
                createdAt: newUser?.createdAt ?? null
            };

            return res.status(201).json({
                success: true,
                data: userResponse,
                message: "Registration successful"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    async login(req: Request, res: Response) {
        try {
            console.log(req.body)
            const parsedData = LoginUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedData.error)
                });
            }
            const { token, user } = await userService.loginUser(parsedData.data);

            const userResponse = {
                userId: user?._id ?? "",
                email: user?.email ?? "",
                fullName: user?.fullName ?? "",
                isInfluencer: user?.isInfluencer ?? false,
                role: user?.role ?? "user",
                createdAt: user?.createdAt ?? null
            };

            return res.status(200).json({
                success: true,
                data: { token, user: userResponse },
                message: "Login successful"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async forgotPassword(req: Request, res: Response) {
        try {
            const { email } = req.body;
            if (!email) throw new HttpError(400, "Email is required");

            const token = await userService.forgotPassword(email);
            let previewUrl = null;

            if (token) {
                try {
                    const emailService = new EmailService();
                    const result = await emailService.sendPasswordResetEmail(email, `${FRONTEND_URL}/reset-password?token=${token}`);
                    previewUrl = result.previewUrl;
                } catch (emailError: any) {
                    console.error("Email sending failed, but continuing for development:", emailError.message);
                }
            }

            return res.status(200).json({
                success: true,
                message: "If the email exists, a reset link has been sent."
            });
        } catch (error: any) {
            console.error("Forgot password error:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Something went wrong"
            });
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) throw new HttpError(400, "Token and new password are required");

            const result = await userService.resetPassword(token, newPassword);
            return res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Something went wrong"
            });
        }
    }

    async whoami(req: any, res: Response) {
        try {
            const user = req.user;
            if (!user) throw new HttpError(401, "Not authenticated");

            return res.status(200).json({
                success: true,
                data: user,
                message: "User authenticated"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async changePassword(req: any, res: Response) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user._id;

            if (!currentPassword || !newPassword) {
                throw new HttpError(400, "Current password and new password are required");
            }

            if (newPassword.length < 6) {
                throw new HttpError(400, "New password must be at least 6 characters long");
            }

            const result = await userService.changePassword(userId, currentPassword, newPassword);
            return res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Failed to change password"
            });
        }
    }
}
