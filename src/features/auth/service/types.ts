type Role = 1213 | 2324;
type Ustaus = 'profilis' | 'virtuve' | 'free';
type Sstatus =
	| 'free'
	| 'Profilis'
	| 'Virtuvė'
	| 'Cancel_profilis'
	| 'Canceled_profilis'
	| 'Cancel_virtuve'
	| 'Canceled_virtuve'
	| 'UNPAID';

export interface TokenPayload {
	user_id: string;
	user_role: Role;
}

export interface TokenPair {
	accessToken: string;
	refreshToken: string;
	refreshTokenHash: string;
}

export interface PasswordResetResponseDto {
	token: string;
	hashedToken: string;
	expiresAt: Date;
}

export interface UserResponseDto {
	user_id: string;
	user_name: string;
	user_role: Role;
	is_course: boolean;
	// str_cus_id: string;
	user_subscription: boolean;
	user_s_subscription: boolean;
	u_status: Ustaus;
	s_status: Sstatus;
}

export interface LoginResponseDto {
	accessToken: string;
	refreshToken: string;
	user: UserResponseDto;
}

export interface RefreshResponseDto {
	accessToken: string;
	newRefreshToken: string;
	user: UserResponseDto;
}
