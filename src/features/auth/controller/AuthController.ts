import { authConfig } from '../config';
import { AuthService } from '../service/AuthService';
import { Request, Response } from 'express';
import type { LoginRequestDto } from '../schemas/LoginSchema';

export class AuthController {
	private authService: AuthService;

	constructor(authService: AuthService) {
		this.authService = authService;

		this.login = this.login.bind(this);
        this.refresh = this.refresh.bind(this);
        this.logout = this.logout.bind(this);
	}

	async login(req: Request, res: Response) {
		const { email, password } = req.body as LoginRequestDto;
		const { accessToken, refreshToken, user } = await this.authService.login(email, password);

		this.setRefreshTokenCookie(res, refreshToken);
        console.log(req.cookies)
		res.status(200).json({
			status: 'success',
			accessToken,
			user,
		});
	}

	async refresh(req: Request, res: Response) {
		const refreshToken = req.cookies[authConfig.REFRESH_TOKEN_COOKIE];

		if (!refreshToken) {
			res.sendStatus(401);
            return;
		}

		const { accessToken, newRefreshToken, user } = await this.authService.refresh(refreshToken);

		// Token rotation - set new refresh token
		this.setRefreshTokenCookie(res, newRefreshToken);

		res.status(200).json({
			status: 'success',
			accessToken,
			user,
		});
	}

    async logout(req: Request, res: Response) {

        const refreshToken = req.cookies[authConfig.REFRESH_TOKEN_COOKIE];
        
        await this.authService.logout(refreshToken);
        
        this.clearRefreshTokenCookie(res);
        res.sendStatus(204);
    }

	private setRefreshTokenCookie(res: Response, token: string) {
		res.cookie(authConfig.REFRESH_TOKEN_COOKIE, token, authConfig.COOKIE_OPTIONS);
	}

    private clearRefreshTokenCookie(res: Response) {
        res.clearCookie(authConfig.REFRESH_TOKEN_COOKIE, {
            httpOnly: authConfig.COOKIE_OPTIONS.httpOnly,
            secure: authConfig.COOKIE_OPTIONS.secure,
            sameSite: authConfig.COOKIE_OPTIONS.sameSite
        });
    }
}
