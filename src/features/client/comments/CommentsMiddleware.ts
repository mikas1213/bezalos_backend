import type { Request, Response, NextFunction } from 'express';
import { Database } from '../../../common/config/db';
import { AppError } from '../../../common/errors/AppError';

export class CommentsMiddleware {
	constructor(private readonly db: Database) {}

	canCommentVideo = async (req: Request, _res: Response, next: NextFunction) => {
		const { videoId } = req.body;

		const data = await this.db.queryOne<{ category: string }>('SELECT category FROM videos WHERE id = $1', [videoId]);

		if (!data) {
			return next(AppError.internal('Toks video neegzistuoja'));
		}

		const videoCategoriesForSubscription = ['Pokalbis', 'Trumpai', 'Vebinaras'];
		const { category } = data;
		const isCourse = category === 'Kursai';
		const isSubscription = videoCategoriesForSubscription.includes(category);
		const { userHasCourse, userHasSubscription } = req;

		if (isCourse && !userHasCourse) {
			return next(AppError.paymentRequired('Šis turinys prieinamas tik įsigijusiems kursą.'));
		}
		if (isSubscription && !userHasSubscription) {
			return next(AppError.paymentRequired('Tik Virtuvės klubo nariams.'));
		}
		next();
	};
}
