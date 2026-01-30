import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http-error';
import { UserRepository } from '../repositories/user.repository';
import { IUser } from '../models/user.model';

// Global augmentation for Express Request to include user property
declare global {
    namespace Express {
        interface Request {
            user?: Record<string, any> | IUser;
        }
    }
}

let userRepository = new UserRepository();

export const authorizedMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        console.log(authHeader);
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new HttpError(401, "Unauthorized, Header malformed");
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            throw new HttpError(401, "Unauthorized, Token missing");
        }
        const decodedToken = jwt.verify(token, JWT_SECRET) as Record<string, any>;
        if (!decodedToken || !decodedToken.id) {
            throw new HttpError(401, "Unauthorized, Token invalid");
        }
        const user = await userRepository.getUserById(decodedToken.id);
        if (!user) {
            throw new HttpError(401, "Unauthorized, User not found");
        }
        // Attach user to request object
        req.user = user;
        next();
    } catch (error: Error | any) {
        return res.status(401).json({ success: false, message: error.message || "Unauthorized" });
    }

// For brand and influencer role-based middleware, see:
//   brand.middleware.ts
//   influencer.middleware.ts
}
