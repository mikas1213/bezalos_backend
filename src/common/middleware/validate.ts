import { z } from 'zod';
import { AppError } from '../errors/AppError';
import { Request, Response, NextFunction } from 'express';

export const validate = <T extends z.ZodSchema>(schema: T) => {
	return (req: Request, _res: Response, next: NextFunction) => {
		const result = schema.safeParse(req.body);

		if (!result.success) {
			const flattened = z.flattenError(result.error);
			throw AppError.validation(flattened.fieldErrors as Record<string, string[]>);
		}

		req.body = result.data;
		next();
	};
};
