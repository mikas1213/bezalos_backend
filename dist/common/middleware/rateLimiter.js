"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const AppError_1 = require("../errors/AppError");
exports.rateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: req => {
        let limit = (req.path.indexOf('auth/refresh') > -1 || req.path.indexOf('/videos') > -1) ? 1000 : 375;
        return limit;
    },
    handler: (req, res, next) => {
        next(new AppError_1.AppError('Too many requests', 429));
    },
    skip: (req) => req.path.indexOf('/admin') > -1,
    standardHeaders: true,
    legacyHeaders: false,
});
