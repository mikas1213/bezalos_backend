import { z } from 'zod';
import { AppError } from '../errors/AppError';
import { Request, Response, NextFunction } from 'express';

export const validate = <T extends z.ZodSchema>(
	schema: T,
	target: 'body' | 'query' | 'params' = 'body',
) => {
	return (req: Request, _res: Response, next: NextFunction) => {
		const result = schema.safeParse(req[target]);

		if (!result.success) {
			const flattened = z.flattenError(result.error);
			throw AppError.validation(flattened.fieldErrors as Record<string, string[]>);
		}

		if (target === 'body') {
			req.body = result.data;
		} else {
			Object.assign(req[target], result.data);
		}
		next();
	};
};
