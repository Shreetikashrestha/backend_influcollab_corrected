export {};
import { Request, Response, NextFunction } from 'express';

export const influencerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'influencer') {
        return res.status(403).json({ success: false, message: 'Forbidden: Influencer access only' });
    }
    next();
};
