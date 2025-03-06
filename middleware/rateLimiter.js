const rateLimit = require('express-rate-limit');
const { RateLimitError } = require('../utils/errors');

const limiter = rateLimit({
    // 15 minute 60 seconds 1000 milliseconds
    windowMs: 15 * 60 * 1000,
    max: req => {
        let limit = (req.path.indexOf('auth/refresh') > -1 || req.path.indexOf('/videos') > -1) ? 500 : 150;
        return limit;
    },

    handler: (req, res, next) => {
        next(new RateLimitError('Too many requests'));
    },

    skip: (req) => req.path.indexOf('/admin') > -1,

    standardHeaders: true,     // Įtraukia Rate Limit info į `RateLimit-*` headers
    legacyHeaders: false,      // Išjungia `X-RateLimit-*` headers

});

module.exports = limiter;