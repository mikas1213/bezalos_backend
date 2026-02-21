import { Request, Response, NextFunction } from 'express';
import { LoginAttemptService } from '../service/LoginAttemptService';
import { AppError } from '../../../common/errors/AppError';

export class SignupRateLimiter {
	// Stricter limits for signup (uses LoginAttemptService config for window)
	private readonly maxAttemptsPerIp = 3; // Only 3 signups per IP per window

	constructor(private loginAttemptService: LoginAttemptService) {}

	/**
	 * Extract client IP address from request
	 */
	private getClientIp(req: Request): string {
		const forwarded = req.headers['x-forwarded-for'];

		if (typeof forwarded === 'string') {
			return forwarded.split(',')[0].trim();
		}

		if (Array.isArray(forwarded)) {
			return forwarded[0];
		}

		return req.socket.remoteAddress ?? '0.0.0.0';
	}

	/**
	 * Middleware function for rate limiting signup attempts
	 */
	middleware() {
		return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
			const ip = this.getClientIp(req);
			const email = req.body?.email as string | undefined;

			try {
				// Check how many signup attempts from this IP
				const result = await this.loginAttemptService.checkRateLimit(ip, email, 'signup');

				// Apply stricter limits for signup
				if (result.ipAttempts >= this.maxAttemptsPerIp) {
					// Calculate retry after using LoginAttemptService
					const retryAfterSeconds = await this.loginAttemptService.getRetryAfterSeconds(
						ip,
						null,
						'signup',
					);

					res.setHeader('Retry-After', retryAfterSeconds.toString());
					res.setHeader('X-RateLimit-Limit', this.maxAttemptsPerIp.toString());
					res.setHeader('X-RateLimit-Remaining', '0');

					throw AppError.tooManyRequests(
						`Too many signup attempts. Please try again in ${retryAfterSeconds} seconds.`,
					);
				}

				// Set rate limit headers
				const remaining = Math.max(0, this.maxAttemptsPerIp - result.ipAttempts);
				res.setHeader('X-RateLimit-Limit', this.maxAttemptsPerIp.toString());
				res.setHeader('X-RateLimit-Remaining', remaining.toString());

				// Attach helper to record attempt after signup completes
				res.locals.recordSignupAttempt = async (success: boolean) => {
					await this.loginAttemptService.recordAttempt(
						ip,
						email ?? null,
						success,
						'signup',
					);
				};

				res.locals.clientIp = ip;

				next();
			} catch (error) {
				if (error instanceof AppError) {
					next(error);
					return;
				}

				// Fail open on unexpected error
				console.error('Signup rate limiter error:', error);
				next();
			}
		};
	}
}

/**
 * Helper to record signup attempt from controller
 */
export async function recordSignupAttempt(res: Response, success: boolean): Promise<void> {
	const record = res.locals.recordSignupAttempt;
	if (typeof record === 'function') {
		await record(success);
	}
}
