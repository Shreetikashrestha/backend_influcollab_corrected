import z from "zod";
import { Request, Response } from "express";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { UserService } from "../services/user.service";

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
            
            // Remove password from response
            const userResponse = {
                userId: newUser?._id ?? "",
                // username: newUser?.username ?? "",
                email: newUser?.email ?? "",
                fullName: newUser?.fullName ?? "",
                isInfluencer: newUser?.isInfluencer ?? false,
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
            
            // Remove password from response
            const userResponse = {
                userId: user?._id ?? "",
                // username: user?.username ?? "",
                email: user?.email ?? "",
                fullName: user?.fullName ?? "",
                isInfluencer: user?.isInfluencer ?? false,
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
}
