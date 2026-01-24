import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { authConfig } from '../config';
import { AppError } from '../../../common/errors/AppError';
import type { PasswordResetResponseDto, UserWithSubscription, TokenPayload, TokenPair } from '../types';

export class TokenService {
	generateAccessToken(payload: TokenPayload): string {
		return this.signToken(
			payload,
			authConfig.ACCESS_TOKEN_SECRET,
			authConfig.ACCESS_TOKEN_EXPIRES,
		);
	}

	generateRefreshToken(payload: TokenPayload): string {
		return this.signToken(
			payload,
			authConfig.REFRESH_TOKEN_SECRET,
			authConfig.REFRESH_TOKEN_EXPIRES,
		);
    }

    async verifyAccessToken(token: string): Promise<TokenPayload> {
        return this.verifyToken(token, authConfig.ACCESS_TOKEN_SECRET);
    }

    async verifyRefreshToken(token: string): Promise<TokenPayload> {
        return this.verifyToken(token, authConfig.REFRESH_TOKEN_SECRET);
    }

	generateRandomToken(bytes: number = 32) {
		return crypto.randomBytes(bytes).toString('hex');
	}

	hashToken(token: string): string {
		return crypto.createHash('sha256').update(token).digest('hex');
	}

	generateTokenPair(user: UserWithSubscription): TokenPair {
		const payload = {
			user_id: user.id,
			role: user.role,
		};

		const accessToken = this.generateAccessToken(payload);
		const refreshToken = this.generateRefreshToken(payload);
		const refreshTokenHash = this.hashToken(refreshToken);

		return {
			accessToken,
			refreshToken,
			refreshTokenHash,
		};
	}

	generatePasswordResetToken(): PasswordResetResponseDto {
		const token = this.generateRandomToken();
		const hashedToken = this.hashToken(token);
		const expiresAt = new Date(
			Date.now() + authConfig.PASSWORD_RESET_EXPIRES_MINUTES * 60 * 1000,
		);

		return {
			token,
			hashedToken,
			expiresAt,
		};
	}

	private signToken(
		payload: TokenPayload,
		secret: string | undefined,
		expires: any,
	): string {
		if (!secret) {
			throw AppError.internal('JWT Secret is not configured');
		}
		return jwt.sign(payload, secret, { expiresIn: expires });
	}

	private verifyToken(token: string, secret: string | undefined): Promise<TokenPayload> {
		if (!secret) {
			throw AppError.internal('JWT secret is not provided in the configuration');
		}

		return new Promise<TokenPayload>((resolve, reject) => {
			jwt.verify(
				token,
				secret,
				(err, decoded) => {
					if (err) {
						return reject(AppError.unauthorized('Token verification failed or expired'));
					}
					resolve(decoded as TokenPayload);
				},
			);
		});
	}
}
