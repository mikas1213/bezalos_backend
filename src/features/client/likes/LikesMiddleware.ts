import type { Request, Response, NextFunction } from 'express';
import { Database } from '../../../common/config/db';
import { AppError } from '../../../common/errors/AppError';

export class LikesMiddleware {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	getVideoContext = async (req: Request, res: Response, next: NextFunction) => {
		const { entityId, entityType, contextEntityId } = req.body;

		if (!['comments', 'videos'].includes(entityType)) {
			next(AppError.internal('The specified like entity does not exist.'));
		}

		const data = await this.db.queryOne('SELECT category FROM videos WHERE id = $1', [contextEntityId]);
		if (!data) {
			next(AppError.internal('The specified context does not exist.'));
		}

		const entity = await this.db.queryOne(`SELECT * FROM ${entityType} WHERE id = $1`, [entityId]);
		if (!entity) {
			next(AppError.internal('The specified entity does not exist.'));
		}
		req.video = {
			...req.video,
			category: data?.category,
		};
		next();
	};

	canLikeVideo = async (req: Request, res: Response, next: NextFunction) => {
		if (!req.video) {
			return next(AppError.internal('Toks video neegzistuoja'));
		}
		const videoCategoriesForSubscription = ['Pokalbis', 'Trumpai', 'Vebinaras'];
		const { category } = req?.video;
		const isCourse = req.video.category === 'Kursai';
		const isSubscription = videoCategoriesForSubscription.includes(category);
		const { userHasCourse, userHasSubscription } = req;

		if (isCourse && !userHasCourse) {
			next(AppError.paymentRequired('Šis turinys prieinamas tik įsigijusiems kursą.'));
		}
		if (isSubscription && !userHasSubscription) {
			next(AppError.paymentRequired('Tik Virtuvės klubo nariams.'));
		}
		next();
	};
}
