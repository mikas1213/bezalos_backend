type RoleKey = 'user' | 'admin';
type RoleVal = 2324 | 1213;

export const roles: Record<RoleKey, RoleVal> = {
	user: 2324,
	admin: 1213,
} as const;
