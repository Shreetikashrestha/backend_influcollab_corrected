import { IUser, UserModel } from "../models/user.model";

export interface IUserRepository {
    getUserByEmail(email: string): Promise<IUser | null>;
    createUser(data: Partial<IUser>): Promise<IUser>;
    getUserById(id: string): Promise<IUser | null>;
    getAllUsers(page: number, limit: number): Promise<{ users: IUser[], total: number }>;
    updateOneUser(id: string, data: Partial<IUser>): Promise<IUser | null>;
    deleteOneUser(id: string): Promise<boolean | null>;
}

export class UserRepository implements IUserRepository {
    async createUser(data: Partial<IUser>): Promise<IUser> {
        const user = new UserModel(data);
        return await user.save();
    }

    async getUserByEmail(email: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ email: email });
        return user;
    }

    async getUserById(id: string): Promise<IUser | null> {
        const user = await UserModel.findById(id);
        return user;
    }

    async getAllUsers(page: number = 1, limit: number = 10): Promise<{ users: IUser[], total: number }> {
        const skip = (page - 1) * limit;
        const total = await UserModel.countDocuments();
        const users = await UserModel.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        return { users, total };
    }

    async updateOneUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
        const updatedUser = await UserModel.findByIdAndUpdate(id, data, { new: true });
        return updatedUser;
    }

    async deleteOneUser(id: string): Promise<boolean | null> {
        const result = await UserModel.findByIdAndDelete(id);
        return result ? true : null;
    }
}
