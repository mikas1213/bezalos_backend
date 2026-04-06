import { Database } from '../../../common/config/db';
import type { UserWithSubscription, CourseOrder } from '../types';
import type { SignupRequestDto } from '../schemas';
import type { ForgotPasswordResponseDto } from './types';

export class AuthRepository {
	constructor(private readonly db: Database) {
		this.db = db;
	}

	async findByEmail(email: string): Promise<UserWithSubscription | null> {
		const query = `
            SELECT 
                u.id, 
                u.role,
                u.email, 
                format_display_name(u.name) AS "displayName",
                u.password, 
                u.stripe_customer_id,
                u.refresh_token_hash,
                s.status AS s_status,
                u.subscription_expires,
                u.subscription_type AS u_status,
                s.current_period_end AS s_subscription_expires
            FROM users AS u
            LEFT JOIN subscriptions AS s ON s.user_id = u.id
            WHERE u.email = $1
        `;

		return await this.db.queryOne<UserWithSubscription>(query, [email]);
	}

	async findById(id: string): Promise<UserWithSubscription | null> {
		const query = `
            SELECT 
                u.id, 
                u.role,
                u.email, 
                format_display_name(u.name) AS "displayName",
                u.password, 
                u.stripe_customer_id,
                u.refresh_token_hash,
                s.status AS s_status,
                u.subscription_expires,
                u.subscription_type AS u_status,
                s.current_period_end AS s_subscription_expires
            FROM users u
            LEFT JOIN subscriptions s ON s.user_id = u.id
            WHERE u.id = $1
        `;

		return await this.db.queryOne<UserWithSubscription>(query, [id]);
	}

	async findByRefreshTokenHash(tokenHash: string): Promise<UserWithSubscription | null> {
		const query = `
            SELECT 
                u.id, 
                u.role,
                u.email, 
                format_display_name(u.name) AS "displayName",
                u.password,
                u.stripe_customer_id,
                u.refresh_token_hash,
                s.status AS s_status,
                u.subscription_expires,
                u.subscription_type AS u_status,
                s.current_period_end AS s_subscription_expires
            FROM users AS u
            LEFT JOIN subscriptions AS s ON s.user_id = u.id
            WHERE u.refresh_token_hash = $1
        `;

		return await this.db.queryOne<UserWithSubscription>(query, [tokenHash]);
	}

	async getUserCourseOrder(userId: string): Promise<CourseOrder | null> {
		const query = `
            SELECT 
                o.id, 
                o.created_at, 
                s.title,
                CASE 
                    WHEN o.created_at IS NULL THEN false
                    WHEN (CURRENT_TIMESTAMP - o.created_at) <= INTERVAL '90 days' THEN true
                    ELSE false
                END AS is_course
            FROM orders o
            LEFT JOIN services s ON s.id = o.service_id
            WHERE o.user_id = $1 AND s.category = 'Kursai' 
            ORDER BY o.created_at DESC 
            LIMIT 1
        `;

		return await this.db.queryOne<CourseOrder>(query, [userId]);
	}

	async updateRefreshToken(userId: string, tokenHash: string | null): Promise<void> {
		const query = `
            UPDATE users 
            SET refresh_token_hash = $1, last_activity = $3, updated_at = $3
            WHERE id = $2
        `;

		await this.db.queryOne(query, [tokenHash, userId, new Date().toISOString()]);
	}

	async emailExists(email: string): Promise<boolean> {
		const query = 'SELECT 1 FROM users WHERE email = $1';
		const rows = await this.db.query(query, [email]);
		return rows.length > 0;
	}

	async create(userData: SignupRequestDto): Promise<void> {
		const { name, email, initialTarget, password } = userData;

		const query = `
            INSERT INTO users (name, email, initial_target, password)
            VALUES ($1, $2, $3, $4)
        `;

		await this.db.queryOne<SignupRequestDto>(query, [name, email, initialTarget, password]);
	}

	async clearRefreshToken(userId: string): Promise<void> {
		await this.updateRefreshToken(userId, null);
	}

	async setPasswordResetToken(email: string, tokenHash: string, expiresAt: Date): Promise<void> {
		const query = `
            UPDATE users 
            SET password_reset_token = $1, 
                password_reset_expires = $2,
                updated_at = $3
            WHERE email = $4
        `;

		await this.db.queryOne(query, [tokenHash, expiresAt.toISOString(), new Date().toLocaleString('lt-LT'), email]);
	}

	async clearPasswordResetToken(email: string): Promise<void> {
		const query = `
            UPDATE users 
            SET password_reset_token = $4, 
                password_reset_expires = $3,
                updated_at = $2
            WHERE email = $1
        `;
		await this.db.queryOne(query, [email, new Date().toLocaleString('lt-LT'), null, null]);
	}

	async findByValidPasswordResetToken(tokenHash: string): Promise<ForgotPasswordResponseDto | null> {
		const query = `
            SELECT email 
            FROM users 
            WHERE password_reset_token = $1 
              AND password_reset_expires > $2
        `;

		return await this.db.queryOne(query, [tokenHash, new Date(Date.now()).toISOString()]);
	}

	async updatePassword(email: string, passwordHash: string): Promise<void> {
		const query = `
            UPDATE users 
            SET password = $1, 
                password_reset_token = NULL,
                password_reset_expires = NULL,
                updated_at = NOW()
            WHERE email = $2
        `;

		await this.db.query(query, [passwordHash, email]);
	}
}
