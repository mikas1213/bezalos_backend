import { authConfig } from '../config';
import { AuthService } from '../service/AuthService';
import { Request, Response } from 'express';
import type { LoginRequestDto, SignupRequestDto, ForgotPasswordRequestDto, UpdatePasswordRequestDto } from '../schemas';
import { recordLoginAttempt } from '../middleware/LoginRateLimiter';
import { recordSignupAttempt } from '../middleware/SignupRateLimiter';

export class AuthController {
	private authService: AuthService;

	constructor(authService: AuthService) {
		this.authService = authService;

		this.signup = this.signup.bind(this);
		this.login = this.login.bind(this);
		this.refresh = this.refresh.bind(this);
		this.logout = this.logout.bind(this);
		this.forgotPassword = this.forgotPassword.bind(this);
		this.validateResetToken = this.validateResetToken.bind(this);
		this.updatePassword = this.updatePassword.bind(this);
	}

	async signup(req: Request, res: Response): Promise<void> {
		const { name, email, initialTarget, password } = req.body as SignupRequestDto;

		try {
			await this.authService.signup({ name, email, initialTarget, password });

			// Record successful signup attempt
			await recordSignupAttempt(res, true);

			res.status(201).json({
				status: 'success',
				message: 'Successfully registered',
			});
		} catch (error) {
			// Record failed signup attempt
			await recordSignupAttempt(res, false);

			// Re-throw error to be handled by global error handler
			throw error;
		}
	}

	async login(req: Request, res: Response): Promise<void> {
		const { email, password } = req.body as LoginRequestDto;
		try {
			const { accessToken, refreshToken, user } = await this.authService.login(email, password);

			// Record successful login attempt
			await recordLoginAttempt(res, true);

			this.setRefreshTokenCookie(res, refreshToken);

			res.status(200).json({
				status: 'success',
				accessToken,
				user,
			});
		} catch (error) {
			// Record failed login attempt
			await recordLoginAttempt(res, false);

			// Re-throw error to be handled by global error handler
			throw error;
		}
	}

	async refresh(req: Request, res: Response): Promise<void> {
		const refreshToken = req.cookies[authConfig.REFRESH_TOKEN_COOKIE];

		if (!refreshToken) {
			res.sendStatus(401);
			return;
		}

		const { accessToken, newRefreshToken, user } = await this.authService.refresh(refreshToken);

		this.setRefreshTokenCookie(res, newRefreshToken);

		res.status(200).json({
			status: 'success',
			accessToken,
			user,
		});
	}

	async logout(req: Request, res: Response): Promise<void> {
		const refreshToken = req.cookies[authConfig.REFRESH_TOKEN_COOKIE];

		await this.authService.logout(refreshToken);

		this.clearRefreshTokenCookie(res);
		res.sendStatus(204);
	}

	async forgotPassword(req: Request, res: Response): Promise<void> {
		const { email } = req.body as ForgotPasswordRequestDto;

		const baseUrl = `${req.protocol}://${req.get('host')}`;
		await this.authService.forgotPassword(email, baseUrl);

		res.status(200).json({
			status: 'success',
			message: 'Jei toks vartotojas egzistuoja, slaptažodžio atstatymo nuoroda išsiųsta į el. paštą.',
		});
	}

	async validateResetToken(req: Request, res: Response): Promise<void> {
		const { token } = req.params as { token: string };
		const { email } = await this.authService.validateResetToken(token);

		res.status(200).json({
			status: 'success',
			email,
		});
	}

	async updatePassword(req: Request, res: Response): Promise<void> {
		const { token } = req.params as { token: string };
		const { password } = req.body as UpdatePasswordRequestDto;

		await this.authService.updatePassword(token, password);

		res.status(200).json({
			status: 'success',
			message: 'Slaptažodis sėkmingai pakeistas.',
		});
	}

	private setRefreshTokenCookie(res: Response, token: string) {
		res.cookie(authConfig.REFRESH_TOKEN_COOKIE, token, authConfig.COOKIE_OPTIONS);
	}

	private clearRefreshTokenCookie(res: Response) {
		res.clearCookie(authConfig.REFRESH_TOKEN_COOKIE, {
			httpOnly: authConfig.COOKIE_OPTIONS.httpOnly,
			secure: authConfig.COOKIE_OPTIONS.secure,
			sameSite: authConfig.COOKIE_OPTIONS.sameSite,
		});
	}
}
