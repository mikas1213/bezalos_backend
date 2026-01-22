import bcrypt from 'bcrypt';
import { AuthRepository } from '../repositories/AuthRepository';
import { TokenService } from './TokenService';
import { AppError } from '../../../common/errors/AppError';
import type { TokenPayload, User } from './types';

// export interface RefreshResult {
//   accessToken: string;
//   newRefreshToken: string;
//   user: User;
// }

// interface CourseOrder {
//   id: string;
//   user_id: string;
//   course_id: string;
//   status: string;
//   is_course: boolean
// }

// o.id, o.created_at, s.title, is_course

// export interface UserInfo {
//   id: string;
//   email: string;
//   username: string;
//   role: string;
//   courseOrder: CourseOrder | null;
//   subscription_expires: Date;
//   subscription_period_end: Date;
//   subscription_type: string;
//   subscription_status: string;
// }

export class AuthService {
	private authRepository: AuthRepository;
	private tokenService: TokenService;

	constructor(authRepository: AuthRepository, tokenService: TokenService) {
		this.authRepository = authRepository;
		this.tokenService = tokenService;
	}

	async login(email: string, password: string) {
		const user = await this.authRepository.findByEmail(email);
        console.log('user: ', user)
		if (!user) {
			throw AppError.unauthorized(
				'Netinkamas el. paštas arba slaptažodis',
			);
		}

		const isValidPassword = await bcrypt.compare(password, user.password);
		if (!isValidPassword) {
			throw AppError.unauthorized(
				'Netinkamas el. paštas arba slaptažodis',
			);
		}

		const courseOrder = await this.authRepository.getUserCourseOrder(
			user.id,
		);

		const { accessToken, refreshToken, refreshTokenHash } =
			this.tokenService.generateTokenPair(user);

		await this.authRepository.updateRefreshToken(user.id, refreshTokenHash);

		const userInfo = this.buildUserInfo(user, courseOrder);

		return {
			accessToken,
			refreshToken,
			user: userInfo,
		};
	}

	async refresh(refreshToken: string): Promise<RefreshResult> {
		let decoded;
		try {
			decoded = await this.tokenService.verifyRefreshToken(refreshToken);
		} catch (err) {
			throw AppError.forbidden('Neteisingas arba pasibaigęs token');
		}

		// Patikrinti ar token hash atitinka DB
		const tokenHash = this.tokenService.hashToken(refreshToken);
		const user =
			await this.authRepository.findByRefreshTokenHash(tokenHash);

		if (!user || user.id !== decoded.user_id) {
			// Possible token reuse attack - invalidate all tokens
			if (decoded.user_id) {
				await this.authRepository.clearRefreshToken(decoded.user_id);
			}
			throw AppError.forbidden('Token reuse detected');
		}

		// Gauti papildomą informaciją
		const courseOrder = await this.authRepository.getUserCourseOrder(
			user.id,
		);

		// Token rotation - generuoti naujus tokenus
		const {
			accessToken,
			refreshToken: newRefreshToken,
			refreshTokenHash,
		} = this.tokenService.generateTokenPair(user);

		// Atnaujinti hash DB
		await this.authRepository.updateRefreshToken(user.id, refreshTokenHash);

		const userInfo = this.buildUserInfo(user, courseOrder);

		return {
			accessToken,
			newRefreshToken,
			user: userInfo,
		};
	}

	private buildUserInfo(user: UserInfo, courseOrder: CorsOptions) {
		const now = new Date();
		//   user_id: decoded.user_id,
		//                 user_name: decoded.user_name,
		//                 user_role: decoded.user_role,
		//                 is_course: user_order?.is_course,
		//                 str_cus_id: user.rows[0].stripe_customer_id,
		//                 user_subscription: subs_exp >= today,
		//                 user_s_subscription: s_subs_exp >= today,
		//                 u_status: user.rows[0].u_status,
		//                 s_status: user.rows[0].s_status,
		return {
			id: user.id,
			email: user.email,
			role: user.role,
			hasActiveSubscription: this.isDateValid(
				user.subscription_expires,
				now,
			),
			hasActiveStripeSubscription: this.isDateValid(
				user.subscription_period_end,
				now,
			),
			subscriptionType: user.subscription_type,
			subscriptionStatus: user.subscription_status,
			hasCourseAccess: courseOrder?.is_course || false,
		};
	}

	private isDateValid(date: Date, now: Date) {
		if (!date) return false;
		return new Date(date) >= now;
	}
}
