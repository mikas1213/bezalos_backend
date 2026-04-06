import express from 'express';
import { catchAsync } from '../../../../common/utils/catchAsync';
import { VirtuveController } from '../controller/VirtuveController';
import { validate } from '../../../../common/middleware/validate';
import { VirtuveQuerySchema } from '../schemas/VirtuveQuerySchema';
import { AuthMiddleware } from '../../../auth/middleware/AuthMiddleware';
import { VirtuveVideoViewsSchema } from '../schemas/VirtuveVideoViewsSchema';
import { videoViewLimiter, checkRecentView } from '../middleware';

export const createVirtuveRouter = (
	virtuveController: VirtuveController,
	authMiddleware: AuthMiddleware,
) => {
	const router = express.Router();
	router.get(
		'/:slug',
		authMiddleware.protect({ required: false }),
		catchAsync(virtuveController.getVideo),
	);

	router.post(
		'/:id',
		videoViewLimiter,
		checkRecentView,
		validate(VirtuveVideoViewsSchema),
		catchAsync(virtuveController.updateVideoPlayCount),
	);
	router.get('/', validate(VirtuveQuerySchema, 'query'), catchAsync(virtuveController.getVideos));

	return router;
};
