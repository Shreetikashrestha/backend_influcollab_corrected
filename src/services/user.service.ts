import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";
import { JWT_SECRET } from "../config/index";

let userRepository = new UserRepository();

export class UserService {
    async registerUser(data: CreateUserDTO) {
        // Check for duplicate email
        const checkEmail = await userRepository.getUserByEmail(data.email);
        if (checkEmail) {
            throw new HttpError(403, "Email already in use");
        }
        console.log(checkEmail  )
        // Check for duplicate username
        // const checkUsername = await userRepository.getUserByUsername(data.username);
        // if (checkUsername) {
        //     throw new HttpError(403, "Username already in use");
        // }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);
        data.password = hashedPassword;

        // Create new user
        const newUser = await userRepository.createUser(data);

        return newUser;
    }

    async loginUser(data: LoginUserDTO) {
        const existingUser = await userRepository.getUserByEmail(data.email);
        if (!existingUser) {
            throw new HttpError(404, "User not found");
        }

        const isPasswordValid = await bcrypt.compare(data.password, existingUser.password);
        if (!isPasswordValid) {
            throw new HttpError(401, "Invalid credentials");
        }

        // Generate JWT
        const payload = {
            id: existingUser._id,
            // username: existingUser.username,
            email: existingUser.email,
            role: existingUser.role,
            isInfluencer: existingUser.isInfluencer
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

        return { token, user: existingUser };
    }

    async getAllUsers() {
        return await userRepository.getAllUsers();
    }

    async getUserById(id: string) {
        const user = await userRepository.getUserById(id);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        return user;
    }

    async updateUser(id: string, data: Partial<any>) {
        const user = await userRepository.updateOneUser(id, data);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        return user;
    }

    async deleteUser(id: string) {
        const result = await userRepository.deleteOneUser(id);
        if (!result) {
            throw new HttpError(404, "User not found");
        }
        return { message: "User deleted successfully" };
    }
}
