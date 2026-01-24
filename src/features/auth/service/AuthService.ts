import bcrypt from 'bcrypt';
import { AuthRepository } from '../repositories/AuthRepository';
import { TokenService } from './TokenService';
import { AppError } from '../../../common/errors/AppError';
import type { UserWithSubscription, CourseOrder, LoginResponseDto, RefreshResponseDto } from '../types';

export class AuthService {
	private authRepository: AuthRepository;
	private tokenService: TokenService;

	constructor(authRepository: AuthRepository, tokenService: TokenService) {
		this.authRepository = authRepository;
		this.tokenService = tokenService;
	}

	async login(email: string, password: string): Promise<LoginResponseDto> {
		const user = await this.authRepository.findByEmail(email);
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

	async refresh(refreshToken: string): Promise<RefreshResponseDto> {
		let decoded;
		try {
			decoded = await this.tokenService.verifyRefreshToken(refreshToken);
		} catch (err) {
			throw AppError.forbidden('Invalid or expired token');
		}

		// Patikrinti ar token hash atitinka DB
		const tokenHash = this.tokenService.hashToken(refreshToken);
		const user = await this.authRepository.findByRefreshTokenHash(tokenHash);

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

    async logout(refreshToken: string) {
        console.log('SERVICE logout refreshToken: ', refreshToken)
        if (!refreshToken) return;

        const tokenHash = this.tokenService.hashToken(refreshToken);
        const user = await this.authRepository.findByRefreshTokenHash(tokenHash);

        if (user) {
            await this.authRepository.clearRefreshToken(user.id);
        }
    }

	private buildUserInfo(user: UserWithSubscription, courseOrder: CourseOrder | null) {
        const today = Date.parse(new Date().toLocaleString('lt-LT', {dateStyle: 'short'}));
        const subs_exp = Date.parse(new Date(user.subscription_expires).toLocaleString('lt-LT', {dateStyle: 'short'}));
        const s_subs_exp = Date.parse(new Date(user.s_subscription_expires).toLocaleString('lt-LT', {dateStyle: 'short'}));

        return {
            user_id: user.id,
            user_name: user.email,
            user_role: user.role,
            str_cus_id: user.stripe_customer_id,
            user_subscription: subs_exp >= today,
            user_s_subscription: s_subs_exp >= today,
            u_status: user.u_status,
            s_status: user.s_status,
            is_course: courseOrder?.is_course || false,
        }
	}
}
