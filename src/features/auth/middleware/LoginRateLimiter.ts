import { Request, Response, NextFunction } from 'express';
import { LoginAttemptService } from '../service/LoginAttemptService';
import { AppError } from '../../../common/errors/AppError';

/**
 * Extended Response locals for rate limiting
 */
export interface RateLimitedLocals {
	recordLoginAttempt: (success: boolean) => Promise<void>;
	clientIp: string;
}

export class LoginRateLimiter {
	constructor(private loginAttemptService: LoginAttemptService) {}

	/**
	 * Extract client IP address from request
	 * Handles proxy scenarios (X-Forwarded-For)
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
	 * Middleware function for rate limiting login attempts
	 *
	 * Usage:
	 *   const rateLimiter = container.resolve('LoginRateLimiter');
	 *   router.post('/login', rateLimiter.middleware(), loginController);
	 */
	middleware() {
		return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
			const ip = this.getClientIp(req);
			const email = req.body?.email as string | undefined;

			try {
				const result = await this.loginAttemptService.checkRateLimit(ip, email, 'login');

				if (!result.allowed) {
					const headers = this.loginAttemptService.getRateLimitHeaders(
						result.ipAttempts,
						true
					);

					// Set rate limit headers
					Object.entries(headers).forEach(([key, value]) => {
						res.setHeader(key, value);
					});

					// Throw rate limit error using AppError
					throw AppError.tooManyRequests(
						`Too many login attempts. Please try again in ${result.retryAfter} seconds.`
					);
				}

				// Set rate limit headers even when not limited
				const headers = this.loginAttemptService.getRateLimitHeaders(
					result.ipAttempts,
					false
				);

				Object.entries(headers).forEach(([key, value]) => {
					res.setHeader(key, value);
				});

				// Attach helper to record attempt after login completes
				res.locals.recordLoginAttempt = async (success: boolean) => {
					await this.loginAttemptService.recordAttempt(ip, email ?? null, success, 'login');
				};

				res.locals.clientIp = ip;

				next();
			} catch (error) {
				// If it's an AppError (like tooManyRequests), pass it to error handler
				if (error instanceof AppError) {
					next(error);
					return;
				}

				// Fail open - allow request through on unexpected error
				console.error('Rate limiter error:', error);
				next();
			}
		};
	}
}

/**
 * Helper to record login attempt from controller
 *
 * Usage:
 *   await recordLoginAttempt(res, true);  // successful
 *   await recordLoginAttempt(res, false); // failed
 */
export async function recordLoginAttempt(res: Response, success: boolean): Promise<void> {
	const record = (res.locals as RateLimitedLocals).recordLoginAttempt;
	if (typeof record === 'function') {
		await record(success);
	}
}
