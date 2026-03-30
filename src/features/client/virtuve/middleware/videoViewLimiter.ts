import rateLimit from 'express-rate-limit';

export const videoViewLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minučių langas
	max: 50, // Maksimaliai 100 užklausų per valandą iš vieno IP
	message: { message: 'Too many requests' },
	standardHeaders: true,
	legacyHeaders: false,
});
