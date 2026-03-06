import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http-error';
import { UserRepository } from '../repositories/user.repository';
import { IUser } from '../models/user.model';

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
        console.log(`[${req.method}] ${req.url} - Authorization Header:`, authHeader);
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Authorization failure: No header or malformed');
            throw new HttpError(401, "Unauthorized, Header malformed");
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            console.log('Authorization failure: Token missing from header');
            throw new HttpError(401, "Unauthorized, Token missing");
        }

        try {
            const decodedToken = jwt.verify(token, JWT_SECRET) as Record<string, any>;
            console.log('Decoded Token:', decodedToken);
            if (!decodedToken || !decodedToken.id) {
                console.log('Authorization failure: Token decoded but ID missing');
                throw new HttpError(401, "Unauthorized, Token invalid");
            }
            const user = await userRepository.getUserById(decodedToken.id);
            if (!user) {
                console.log('Authorization failure: User not found for ID:', decodedToken.id);
                throw new HttpError(401, "Unauthorized, User not found");
            }
            req.user = user;
            next();
        } catch (jwtError: any) {
            console.log('JWT Verification Error:', jwtError.message);
            throw new HttpError(401, `Unauthorized, Token problematic: ${jwtError.message}`);
        }
    } catch (error: Error | any) {
        console.log('Authorized Middleware Error:', error.message);
        return res.status(401).json({ success: false, message: error.message || "Unauthorized" });
    }
}
