import mongoose, { Document, Schema } from "mongoose";
import { UserType } from "../types/user.type";

const UserSchema: Schema = new Schema({
    // username: { type: String, required: true, unique: true, minlength: 3 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    fullName: { type: String, required: true },
    isInfluencer: { type: Boolean, default: false },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
}, {
    timestamps: true, // createdAt and updatedAt (auto fields)
});

export interface IUser extends UserType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
}

export const UserModel = mongoose.model<IUser>('User', UserSchema);
