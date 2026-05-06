import { validate } from 'uuid';
import { Request, Response, NextFunction } from 'express';

export const validateUUID = (req: Request, res: Response, next: NextFunction) => {
	const uuid = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
	if (!validate(uuid)) {
		return res.status(400).json({ message: 'Neteisingas UUID formatas' });
	}
	next();
};
