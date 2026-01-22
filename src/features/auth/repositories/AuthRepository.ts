import { Pool } from 'pg';
import type { 
    UserWithPassword,
    UserWithName,
    UserWithRefreshToken,
    CourseOrder,
    CreateUserData
} from './types';

import type { UserInfo } from '../service/AuthService';

export class AuthRepository {
	constructor(private  readonly db: Pool) {
		this.db = db;
	}

	async findByEmail(email: string): Promise<UserWithPassword> {
		const query = `
            SELECT 
                u.id, 
                u.email, 
                u.password, 
                u.role,
                u.stripe_customer_id,
                u.subscription_expires,
                u.subscription_type,
                u.refresh_token_hash,
                s.status AS subscription_status,
                s.current_period_end AS subscription_period_end
            FROM users AS u
            LEFT JOIN subscriptions AS s ON s.user_id = u.id
            WHERE u.email = $1
        `;
        `users.id, 
        stripe_customer_id, 
        role, 
        email, 
        password, 
        subscription_expires, 
        subscription_type AS u_status, 

        s.status AS s_status, 
        s.current_period_end AS s_subscription_expires 
        FROM users LEFT JOIN subscriptions as s ON s.user_id = users.id WHERE email = $1`

		const rows = await this.db.query<UserWithPassword>(query, [email]);
		return rows[0] || null;
	} 

    async findById(id: string): Promise<UserWithName> {
        const query = `
            SELECT 
                u.id, 
                u.name,
                u.email, 
                u.role,
                u.stripe_customer_id,
                u.subscription_expires,
                u.subscription_type,
                s.status AS subscription_status,
                s.current_period_end AS subscription_period_end
            FROM users u
            LEFT JOIN subscriptions s ON s.user_id = u.id
            WHERE u.id = $1
        `;
        
        const { rows } = await this.db.query<UserWithName>(query, [id]);
        return rows[0] || null;
    }

    async findByRefreshTokenHash(tokenHash: string): Promise<UserInfo> {
        const query = `
            SELECT 
                u.id, 
                u.email, 
                u.role,
                u.stripe_customer_id,
                u.subscription_expires,
                u.subscription_type,
                u.refresh_token_hash,
                s.status AS subscription_status,
                s.current_period_end AS subscription_period_end
            FROM users u
            LEFT JOIN subscriptions s ON s.user_id = u.id
            WHERE u.refresh_token_hash = $1
        `;
        
        const { rows } = await this.db.query<UserInfo>(query, [tokenHash]);
        return rows[0] || null;
    }

	async getUserCourseOrder(userId: string): Promise<CourseOrder> {
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

		const rows = await this.db.query<CourseOrder>(query, [userId]);
		return rows[0] || null;
	}

	async updateRefreshToken(userId: string, tokenHash: string | null): Promise<void> {
		const query = `
            UPDATE users 
            SET refresh_token_hash = $1, last_activity = NOW(), updated_at = NOW()
            WHERE id = $2
        `;

		await this.db.query(query, [tokenHash, userId]);
	}

    async emailExists(email: string): Promise<boolean> {
        const query = 'SELECT 1 FROM users WHERE email = $1';
        const { rows } = await this.db.query(query, [email]);
        return rows.length > 0;
    }

    async create(userData: CreateUserData): Promise<CreateUserData> {
        const { name, email, initialTarget, passwordHash } = userData;
        
        const query = `
            INSERT INTO users (name, email, initial_target, password, created_at, updated_at)
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING id, name, email, role
        `;
        
        const { rows } = await this.db.query<CreateUserData>(query, [
            name, 
            email, 
            initialTarget, 
            passwordHash
        ]);
        
        return rows[0];
    }

    async clearRefreshToken(userId: string) {
        await this.updateRefreshToken(userId, null);
    }

    async setPasswordResetToken(email, tokenHash, expiresAt) {
        const query = `
            UPDATE users 
            SET password_reset_token = $1, 
                password_reset_expires = $2,
                updated_at = NOW()
            WHERE email = $3
        `;
        
        await this.db.query(query, [tokenHash, expiresAt.toISOString(), email]);
    }

    async clearPasswordResetToken(email) {
        const query = `
            UPDATE users 
            SET password_reset_token = NULL, 
                password_reset_expires = NULL,
                updated_at = NOW()
            WHERE email = $1
        `;
        
        await this.db.query(query, [email]);
    }

    async findByValidPasswordResetToken(tokenHash) {
        const query = `
            SELECT id, email 
            FROM users 
            WHERE password_reset_token = $1 
              AND password_reset_expires > NOW()
        `;
        
        const { rows } = await this.db.query(query, [tokenHash]);
        return rows[0] || null;
    }

    async updatePassword(email, passwordHash) {
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
