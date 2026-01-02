import rateLimit from 'express-rate-limit';
import { AppError } from '../errors/AppError';

export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: req => {
        let limit = (req.path.indexOf('auth/refresh') > -1 || req.path.indexOf('/videos') > -1) ? 1000 : 375;
        return limit;
    },

    handler: (req, res, next) => {
        next(new AppError('Too many requests', 429));
    },

    skip: (req) => req.path.indexOf('/admin') > -1,

    standardHeaders: true,
    legacyHeaders: false,
});