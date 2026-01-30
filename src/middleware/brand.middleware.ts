export {};
import { Request, Response, NextFunction } from 'express';

export const brandMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'brand') {
        return res.status(403).json({ success: false, message: 'Forbidden: Brand access only' });
    }
    next();
};
