import bcrypt from 'bcrypt';
import { AuthRepository } from '../repositories/AuthRepository';
import { TokenService } from './TokenService';
import { EmailService } from '../../../common/email/EmailService';
import { AppError } from '../../../common/errors/AppError';
import { authConfig } from '../config';
import type { SignupRequestDto } from '../schemas';
import type { LoginResponseDto, RefreshResponseDto } from './types';
import type { UserWithSubscription, CourseOrder } from '../types';
import type { ForgotPasswordResponseDto } from '../repositories/types';
import type { UserResponseDto } from './types';

export class AuthService {
	private authRepository: AuthRepository;
	private tokenService: TokenService;
	private emailService: EmailService;

	constructor(authRepository: AuthRepository, tokenService: TokenService, emailService: EmailService) {
		this.authRepository = authRepository;
		this.tokenService = tokenService;
		this.emailService = emailService;
	}

	async signup(userData: SignupRequestDto): Promise<void> {
		const { name, email, initialTarget, password } = userData as SignupRequestDto;

		const exists = await this.authRepository.emailExists(email);
		if (exists) {
			throw AppError.conflict('Toks vartotojas jau yra');
		}

		const passwordHash = await bcrypt.hash(password, authConfig.SALT_ROUNDS);

		await this.authRepository.create({
			name,
			email,
			initialTarget,
			password: passwordHash,
		});

		await this.emailService.sendWelcome(email, initialTarget);
	}

	async login(email: string, password: string): Promise<LoginResponseDto> {
		const user = await this.authRepository.findByEmail(email);

		// Timing attack protection:
		const dummyHash = '$2b$10$N9qo8uLOickgx2ZMRZoMye1p4HQJNLjKGJKlPXfyh0aU0v8F5P.3K';
		const passwordHash = user ? user.password : dummyHash;
		const isValidPassword = await bcrypt.compare(password, passwordHash);

		if (!user || !isValidPassword) {
			throw AppError.unauthorized('Netinkamas el. paštas arba slaptažodis');
		}

		const courseOrder = await this.authRepository.getUserCourseOrder(user.id);
		const { accessToken, refreshToken, refreshTokenHash } = this.tokenService.generateTokenPair(user);

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
		const courseOrder = await this.authRepository.getUserCourseOrder(user.id);

		// Token rotation - generuoti naujus tokenus
		const { accessToken, refreshToken: newRefreshToken, refreshTokenHash } = this.tokenService.generateTokenPair(user);

		await this.authRepository.updateRefreshToken(user.id, refreshTokenHash);
		const userInfo = this.buildUserInfo(user, courseOrder);

		return {
			accessToken,
			newRefreshToken,
			user: userInfo,
		};
	}

	async logout(refreshToken: string): Promise<void> {
		if (!refreshToken) return;

		const tokenHash = this.tokenService.hashToken(refreshToken);
		const user = await this.authRepository.findByRefreshTokenHash(tokenHash);

		if (user) {
			await this.authRepository.clearRefreshToken(user.id);
		}
	}

	async forgotPassword(email: string, baseUrl: string): Promise<void> {
		const user = await this.authRepository.findByEmail(email);

		if (!user) {
			await this.delay(100);
			return;
		}

		try {
			const { token, hashedToken, expiresAt } = this.tokenService.generatePasswordResetToken();
			await this.authRepository.setPasswordResetToken(email, hashedToken, expiresAt);

			const resetUrl = `${baseUrl}/keisti-slaptazodi/${token}`;
			await this.emailService.sendPasswordReset(email, resetUrl);
		} catch (err) {
			await this.authRepository.clearPasswordResetToken(email);
			throw err;
		}
	}

	async validateResetToken(token: string): Promise<ForgotPasswordResponseDto> {
		const hashedToken = this.tokenService.hashToken(token);
		const user = await this.authRepository.findByValidPasswordResetToken(hashedToken);
		if (!user) {
			throw AppError.badRequest('Nuoroda neteisinga arba nebegaliojanti');
		}

		return { email: user.email };
	}

	async updatePassword(token: string, password: string): Promise<void> {
		const hashedToken = this.tokenService.hashToken(token);
		const user = await this.authRepository.findByValidPasswordResetToken(hashedToken);

		if (!user) {
			throw AppError.badRequest('Nuoroda neteisinga arba nebegaliojanti');
		}

		const passwordHash = await bcrypt.hash(password, authConfig.SALT_ROUNDS);
		await this.authRepository.updatePassword(user.email, passwordHash);
	}

	private buildUserInfo(user: UserWithSubscription, courseOrder: CourseOrder | null): UserResponseDto {
		const today = Date.parse(new Date().toLocaleString('lt-LT', { dateStyle: 'short' }));
		const subs_exp = Date.parse(new Date(user.subscription_expires).toLocaleString('lt-LT', { dateStyle: 'short' }));
		const s_subs_exp = Date.parse(new Date(user.s_subscription_expires).toLocaleString('lt-LT', { dateStyle: 'short' }));

		return {
			user_id: user.id,
			user_name: user.email,
			user_role: user.role,
			displayName: user.displayName,
			user_subscription: subs_exp >= today,
			user_s_subscription: s_subs_exp >= today,
			u_status: user.u_status,
			s_status: user.s_status,
			is_course: courseOrder?.is_course || false,
		};
	}

	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}
