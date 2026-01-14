type RefreshTokenCookie = 'jwt';
type SameSite = 'strict' | 'lax' | 'none';

type CookieOptions = {
    httpOnly: boolean,
    secure: boolean,
    sameSite: SameSite,
    maxAge: number,
};


interface AuthConfig {
    REFRESH_TOKEN_COOKIE: RefreshTokenCookie;
    COOKIE_OPTIONS: CookieOptions;
}

export const authConfig: AuthConfig = {
	REFRESH_TOKEN_COOKIE: 'jwt',
	COOKIE_OPTIONS: {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
	},
};
