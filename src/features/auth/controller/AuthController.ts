import { authConfig } from '../config';
import { AuthService } from '../service/AuthService';
import { Request, Response } from 'express';

export class AuthController {
	private authService: AuthService;

	constructor(authService: AuthService) {
		this.authService = authService;
		this.login = this.login.bind(this);
	}

	async login(req: Request, res: Response) {
		const { email, password } = req.body;
		const { accessToken, refreshToken, user } = await this.authService.login(email, password);

		this.setRefreshTokenCookie(res, refreshToken);

		res.status(200).json({
			status: 'success',
            accessToken,
			user
		});
	}

     async refresh(req: Request, res: Response) {
        const refreshToken = req.cookies[authConfig.REFRESH_TOKEN_COOKIE];
        
        if (!refreshToken) {
            return res.sendStatus(401);
        }

        const { accessToken, newRefreshToken, user } = await this.authService.refresh(refreshToken);

        // Token rotation - set new refresh token
        this.setRefreshTokenCookie(res, newRefreshToken);

        res.status(200).json({
            status: 'success',
            accessToken,
            user
        });
    }

	private setRefreshTokenCookie(res: Response, token: string) {
		res.cookie(
			authConfig.REFRESH_TOKEN_COOKIE,
			token,
			authConfig.COOKIE_OPTIONS,
		);
	}
}
