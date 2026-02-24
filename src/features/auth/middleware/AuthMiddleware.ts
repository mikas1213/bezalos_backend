import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../service/TokenService';
import { AppError } from '../../../common/errors/AppError';

interface AuthMiddlewareOptions {
	required?: boolean;
}

export class AuthMiddleware {
	constructor(private readonly tokenService: TokenService) {}

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
					return next(AppError.forbidden('Neteisingas arba pasibaigęs token'));
				}
				next();
			}
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
