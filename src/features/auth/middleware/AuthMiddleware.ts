import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../service/TokenService';
import { AppError } from '../../../common/errors/AppError';
import { Database } from '../../../common/config/db';
type SubscriptionTypes =
	| 'free'
	| 'profilis'
	| 'Profilis'
	| 'virtuve'
	| 'Virtuvė'
	| 'virtuve_plus'
	| 'Virtuvė Plus'
	| 'Cancel_virtuve_plus'
	| 'Cancel_profilis'
	| 'Canceled_profilis'
	| 'Cancel_virtuve'
	| 'Canceled_virtuve'
	| 'UNPAID';
interface AuthMiddlewareOptions {
	required?: boolean;
}

export class AuthMiddleware {
	constructor(
		private readonly tokenService: TokenService,
		private readonly db: Database,
	) {}

	protect = (options: AuthMiddlewareOptions = {}) => {
		const { required = true } = options;

		return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
			try {
				const authHeader = req.headers.authorization || (req.headers['Authorization'] as string);

				if (!authHeader?.startsWith('Bearer ')) {
					if (required) {
						throw AppError.unauthorized('Prašome prisijungti');
					}
					return next();
				}

				const token = authHeader.split(' ')[1];

				if (!token) {
					if (required) {
						throw AppError.unauthorized('Prašome prisijungti');
					}
					return next();
				}

				const decoded = await this.tokenService.verifyAccessToken(token);
				req.user = {
					id: decoded.user_id,
					role: decoded.user_role,
				};

				next();
			} catch (err) {
				if (required) {
					if (err instanceof AppError) {
						return next(err);
					}
					return next(AppError.unauthorized('Neteisingas arba pasibaigęs token'));
				}
				next();
			}
		};
	};

	isCourse = (options: AuthMiddlewareOptions = {}) => {
		const { required = true } = options;
		return async (req: Request, res: Response, next: NextFunction) => {
			const userId = req.user?.id;

			const query = `
            SELECT CASE WHEN (CURRENT_TIMESTAMP - o.created_at) <= INTERVAL '90 days' 
            THEN true ELSE false END AS is_course
            FROM orders AS o
            LEFT JOIN services AS s ON s.id = o.service_id
            WHERE o.user_id = $1 AND s.category = 'Kursai'
            ORDER BY o.created_at DESC LIMIT 1`;

			const data = await this.db.queryOne(query, [userId]);
			req.userHasCourse = !!data?.is_course;
			if (!data?.is_course && required) {
				return next(AppError.forbidden('Neapmokėta paslauga'));
			}
			next();
		};
	};

	isSubscription = (options: AuthMiddlewareOptions, ...allowedSubscriptionTypes: SubscriptionTypes[]) => {
		return async (req: Request, res: Response, next: NextFunction) => {
			const { required = true } = options;

			const userId = req?.user?.id;
			const query = `
            SELECT 
                subscription_expires, 
                subscription_type AS u_status, 
                s.status AS s_status, 
                s.current_period_end AS s_subscription_expires
            FROM users 
            LEFT JOIN subscriptions AS s ON s.user_id = users.id 
            WHERE users.id = $1
        `;

			const data = await this.db.queryOne(query, [userId]);
			const today = Date.parse(new Date().toLocaleString('lt-LT', { dateStyle: 'short' }));
			const subs_exp = Date.parse(
				new Date(data?.subscription_expires).toLocaleString('lt-LT', {
					dateStyle: 'short',
				}),
			);
			const s_subs_exp = Date.parse(
				new Date(data?.s_subscription_expires).toLocaleString('lt-LT', {
					dateStyle: 'short',
				}),
			);

			const user_subscription = subs_exp >= today;
			const user_s_subscription = s_subs_exp >= today;

			const u_sub = user_subscription && allowedSubscriptionTypes.includes(data?.u_status);
			const s_sub = user_s_subscription && allowedSubscriptionTypes.includes(data?.s_status);
			const hasSubscription = !!(u_sub || s_sub);
			req.userHasSubscription = hasSubscription;

			if (!hasSubscription && required) {
				return next(AppError.paymentRequired('Reikalinga Virtuvės narystė'));
			}
			next();
		};
	};

	restrictTo = (...allowedRoles: number[]) => {
		return (req: Request, res: Response, next: NextFunction): void => {
			if (!req.user) {
				return next(AppError.unauthorized('Prašome prisijungti'));
			}

			if (!allowedRoles.includes(req.user.role)) {
				return next(AppError.forbidden('Neturite teisių atlikti šį veiksmą'));
			}

			next();
		};
	};
}
