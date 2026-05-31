import express from 'express';
import type { LikesController } from './LikesController';
import type { AuthMiddleware } from '../../auth/middleware/AuthMiddleware';
import type { LikesMiddleware } from './LikesMiddleware';
import { catchAsync } from '../../../common/utils/catchAsync';

export const createLikesRouter = (
	likesController: LikesController,
	authMiddleware: AuthMiddleware,
	likesMiddleware: LikesMiddleware,
) => {
	const router = express.Router();
	router.post(
		'/videos',
		authMiddleware.protect({ required: true }),
		likesMiddleware.getVideoContext,
		authMiddleware.isCourse({ required: false }),
		authMiddleware.isSubscription(
			{ required: false },
			'virtuve',
			'Virtuvė',
			'Cancel_virtuve',
			'Virtuvė Plus',
			'virtuve_plus',
			'Cancel_virtuve_plus',
		),
		likesMiddleware.canLikeVideo,
		catchAsync(likesController.likesToggle),
	);

	router.post(
		'/comments',
		authMiddleware.protect({ required: true }),
		likesMiddleware.getVideoContext,
		authMiddleware.isCourse({ required: false }),
		authMiddleware.isSubscription(
			{ required: false },
			'virtuve',
			'Virtuvė',
			'Cancel_virtuve',
			'Virtuvė Plus',
			'virtuve_plus',
			'Cancel_virtuve_plus',
		),
		likesMiddleware.canLikeVideo,
		catchAsync(likesController.likesToggle),
	);

	router.post('/recipes', authMiddleware.protect({ required: true }), catchAsync(likesController.likesToggle));
	return router;
};
