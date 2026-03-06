import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";
import { JWT_SECRET } from "../config/index";
import { UserModel } from "../models/user.model";

export class UserService {
    private userRepository: UserRepository;

    constructor(userRepository?: UserRepository) {
        this.userRepository = userRepository || new UserRepository();
    }

    async registerUser(data: CreateUserDTO) {
        const checkEmail = await this.userRepository.getUserByEmail(data.email);
        if (checkEmail) {
            throw new HttpError(403, "Email already in use");
        }
        console.log(checkEmail)

        const hashedPassword = await bcrypt.hash(data.password, 10);
        data.password = hashedPassword;

        const newUser = await this.userRepository.createUser(data);

        return newUser;
    }

    async loginUser(data: LoginUserDTO) {
        const existingUser = await this.userRepository.getUserByEmail(data.email);
        if (!existingUser) {
            throw new HttpError(404, "User not found");
        }

        const isPasswordValid = await bcrypt.compare(data.password, existingUser.password);
        if (!isPasswordValid) {
            throw new HttpError(401, "Invalid credentials");
        }

        const payload = {
            id: existingUser._id,
            email: existingUser.email,
            role: existingUser.role,
            isInfluencer: existingUser.isInfluencer
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

        return { token, user: existingUser };
    }

    async getAllUsers(page: number = 1, limit: number = 10) {
        return await this.userRepository.getAllUsers(page, limit);
    }

    async getUserById(id: string) {
        const user = await this.userRepository.getUserById(id);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        return user;
    }

    async updateUser(id: string, data: Partial<any>) {
        const user = await this.userRepository.updateOneUser(id, data);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        return user;
    }

    async deleteUser(id: string) {
        const result = await this.userRepository.deleteOneUser(id);
        if (!result) {
            throw new HttpError(404, "User not found");
        }
        return { message: "User deleted successfully" };
    }

    async forgotPassword(email: string) {
        const user = await this.userRepository.getUserByEmail(email);
        if (!user) {
            return null;
        }

        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');

        const hashedToken = await bcrypt.hash(resetToken, 10);
        const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        await this.userRepository.updateOneUser(user._id.toString(), {
            resetPasswordToken: hashedToken,
            resetPasswordExpires: resetExpires
        } as any);

        return resetToken;
    }

    async resetPassword(token: string, newPassword: any) {
        const usersWithTokens = await UserModel.find({
            resetPasswordExpires: { $gt: Date.now() }
        });

        let targetUser = null;
        for (const user of usersWithTokens) {
            if (user.resetPasswordToken && await bcrypt.compare(token, user.resetPasswordToken)) {
                targetUser = user;
                break;
            }
        }

        if (!targetUser) {
            throw new HttpError(400, "Invalid or expired password reset token");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        targetUser.password = hashedPassword;
        targetUser.resetPasswordToken = undefined;
        targetUser.resetPasswordExpires = undefined;
        await targetUser.save();

        return { message: "Password reset successful" };
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await this.userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new HttpError(401, "Current password is incorrect");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.userRepository.updateOneUser(userId, { password: hashedPassword } as any);

        return { message: "Password changed successfully" };
    }
}
