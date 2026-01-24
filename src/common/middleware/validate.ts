import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate = <T extends z.ZodSchema>(schema: T) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);
        
        if(!result.success) {
            const flattened = z.flattenError(result.error);
            return res.status(400).json({
                status: 'error',
                errors: flattened.fieldErrors
            });
        }
        req.body = result.data;
        next();
    };
};
 