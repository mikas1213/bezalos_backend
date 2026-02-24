import { Database } from '../../../common/config/db';

export interface LoginAttempt {
	id: string;
	ip_address: string;
	email: string | null;
	success: boolean;
	attempted_at: Date;
	attempt_type: 'login' | 'signup';
}

export interface RateLimitResult {
	allowed: boolean;
	ipAttempts: number;
	emailAttempts?: number;
	remainingAttempts?: number;
	retryAfter?: number;
}

export interface RateLimitConfig {
	windowMinutes: number;
	maxAttemptsPerIp: number;
	maxAttemptsPerEmail: number;
	lockoutMinutes: number;
}

export class LoginAttemptService {
	private config: RateLimitConfig = {
		windowMinutes: 15, // Time window to check attempts
		maxAttemptsPerIp: 10, // Max failed attempts from same IP
		maxAttemptsPerEmail: 5, // Max failed attempts for same email
		lockoutMinutes: 15, // Lockout duration after exceeding limit
	};

	constructor(private readonly db: Database) {}

	/**
	 * Record a login/signup attempt in the database
	 */
	async recordAttempt(
		ip: string,
		email: string | null,
		success: boolean,
		attemptType: 'login' | 'signup' = 'login'
	): Promise<void> {
		const query = `
			INSERT INTO login_attempts (ip_address, email, success, attempt_type, attempted_at)
			VALUES ($1, $2, $3, $4, NOW())
		`;

		await this.db.query(query, [ip, email, success, attemptType]);
	}

	/**
	 * Check if login/signup should be rate limited based on IP and email
	 */
	async checkRateLimit(
		ip: string,
		email?: string,
		attemptType: 'login' | 'signup' = 'login'
	): Promise<RateLimitResult> {
		const windowStart = new Date(Date.now() - this.config.windowMinutes * 60 * 1000);

		// Check IP-based rate limit
		const ipAttempts = await this.getFailedAttempts(ip, null, windowStart, attemptType);

		if (ipAttempts >= this.config.maxAttemptsPerIp) {
			const retryAfter = await this.getRetryAfter(ip, null, attemptType);
			return {
				allowed: false,
				ipAttempts,
				remainingAttempts: 0,
				retryAfter,
			};
		}

		// Check email-based rate limit if email provided
		if (email) {
			const emailAttempts = await this.getFailedAttempts(null, email, windowStart, attemptType);

			if (emailAttempts >= this.config.maxAttemptsPerEmail) {
				const retryAfter = await this.getRetryAfter(null, email, attemptType);
				return {
					allowed: false,
					ipAttempts,
					emailAttempts,
					remainingAttempts: 0,
					retryAfter,
				};
			}

			return {
				allowed: true,
				ipAttempts,
				emailAttempts,
				remainingAttempts: Math.min(
					this.config.maxAttemptsPerIp - ipAttempts,
					this.config.maxAttemptsPerEmail - emailAttempts
				),
			};
		}

		return {
			allowed: true,
			ipAttempts,
			remainingAttempts: this.config.maxAttemptsPerIp - ipAttempts,
		};
	}

	/**
	 * Get count of failed login/signup attempts
	 */
	private async getFailedAttempts(
		ip: string | null,
		email: string | null,
		windowStart: Date,
		attemptType: 'login' | 'signup' = 'login'
	): Promise<number> {
		let query = `
			SELECT COUNT(*) as count
			FROM login_attempts
			WHERE success = false
			AND attempted_at > $1
			AND attempt_type = $2
		`;

		const params: (string | Date)[] = [windowStart, attemptType];

		if (ip) {
			query += ` AND ip_address = $${params.length + 1}`;
			params.push(ip);
		}

		if (email) {
			query += ` AND email = $${params.length + 1}`;
			params.push(email);
		}

		const result = await this.db.queryOne<{ count: string }>(query, params);
		return parseInt(result?.count ?? '0', 10);
	}

	/**
	 * Calculate seconds until user can retry after being rate limited (private)
	 */
	private async getRetryAfter(
		ip: string | null,
		email: string | null,
		attemptType: 'login' | 'signup' = 'login'
	): Promise<number> {
		return this.getRetryAfterSeconds(ip, email, attemptType);
	}

	/**
	 * Calculate seconds until user can retry after being rate limited (public)
	 * Can be used by custom rate limiters with different thresholds
	 */
	async getRetryAfterSeconds(
		ip: string | null,
		email: string | null,
		attemptType: 'login' | 'signup' = 'login'
	): Promise<number> {
		let query = `
			SELECT attempted_at
			FROM login_attempts
			WHERE success = false
			AND attempt_type = $1
		`;

		const params: string[] = [attemptType];

		if (ip) {
			query += ` AND ip_address = $${params.length + 1}`;
			params.push(ip);
		}

		if (email) {
			query += ` AND email = $${params.length + 1}`;
			params.push(email);
		}

		query += ` ORDER BY attempted_at DESC LIMIT 1`;

		const result = await this.db.queryOne<{ attempted_at: Date }>(query, params);

		if (!result) {
			return 0;
		}

		const lockoutEnd = new Date(result.attempted_at);
		lockoutEnd.setMinutes(lockoutEnd.getMinutes() + this.config.lockoutMinutes);

		const now = new Date();
		const secondsRemaining = Math.ceil((lockoutEnd.getTime() - now.getTime()) / 1000);

		return Math.max(0, secondsRemaining);
	}

	/**
	 * Generate rate limit headers for HTTP response
	 */
	getRateLimitHeaders(attempts: number, isLimited: boolean): Record<string, string> {
		const remaining = Math.max(0, this.config.maxAttemptsPerIp - attempts);

		return {
			'X-RateLimit-Limit': this.config.maxAttemptsPerIp.toString(),
			'X-RateLimit-Remaining': remaining.toString(),
			'X-RateLimit-Reset': new Date(
				Date.now() + this.config.windowMinutes * 60 * 1000
			).toISOString(),
			...(isLimited && { 'Retry-After': this.config.lockoutMinutes.toString() }),
		};
	}

	/**
	 * Clean up old login attempts (call this periodically)
	 * Removes attempts older than the configured window
	 */
	async cleanupOldAttempts(): Promise<number> {
		const cutoffDate = new Date(Date.now() - this.config.windowMinutes * 60 * 1000 * 2);

		const query = `
			DELETE FROM login_attempts
			WHERE attempted_at < $1
		`;

		const result = await this.db.query<{ count: number }>(query, [cutoffDate]);
		return result.length;
	}

	/**
	 * Get recent login attempts for monitoring/admin purposes
	 */
	async getRecentAttempts(limit: number = 100): Promise<LoginAttempt[]> {
		const query = `
			SELECT id, ip_address, email, success, attempt_type, attempted_at
			FROM login_attempts
			ORDER BY attempted_at DESC
			LIMIT $1
		`;

		return this.db.query<LoginAttempt>(query, [limit]);
	}
}
