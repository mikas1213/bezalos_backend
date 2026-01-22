type RefreshTokenCookie = 'jwt';
type SameSite = 'strict' | 'lax' | 'none';

type CookieOptions = {
	httpOnly: boolean;
	secure: boolean;
	sameSite: SameSite;
	maxAge: number;
};

interface AuthConfig {
    SALT_ROUNDS: number;
    ACCESS_TOKEN_EXPIRES: string;
    REFRESH_TOKEN_EXPIRES: string;
    PASSWORD_RESET_EXPIRES_MINUTES: number;
	REFRESH_TOKEN_COOKIE: RefreshTokenCookie;
	COOKIE_OPTIONS: CookieOptions;
  readonly ACCESS_TOKEN_SECRET: string; 
  readonly REFRESH_TOKEN_SECRET: string;
}

export const authConfig: AuthConfig = {
    SALT_ROUNDS: 12,
    ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES || '15m',
    REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES || '7d',
    PASSWORD_RESET_EXPIRES_MINUTES: 10,
	REFRESH_TOKEN_COOKIE: 'jwt',
	COOKIE_OPTIONS: {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
	},

	get ACCESS_TOKEN_SECRET() {
		if (!process.env.ACCESS_TOKEN_SECRET) {
			throw new Error('ACCESS_TOKEN_SECRET must be defined');
		}
		return process.env.ACCESS_TOKEN_SECRET;
	},

	get REFRESH_TOKEN_SECRET() {
		if (!process.env.REFRESH_TOKEN_SECRET) {
			throw new Error('REFRESH_TOKEN_SECRET must be defined');
		}
		return process.env.REFRESH_TOKEN_SECRET;
	},
};
