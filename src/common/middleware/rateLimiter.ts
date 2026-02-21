import rateLimit from 'express-rate-limit';
import { AppError } from '../errors/AppError';
import { Request, Response, NextFunction } from 'express';
export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: (req: Request): number => {
        let limit = (req.path.indexOf('auth/refresh') > -1 || req.path.indexOf('/videos') > -1) ? 1000 : 375;
        return limit;
    },

    handler: (req: Request, res: Response, next: NextFunction): void => {
        next(new AppError('Too many requests', 429));
    },

    skip: (req: Request): boolean => req.path.indexOf('/admin') > -1,

    standardHeaders: true,
    legacyHeaders: false,
});