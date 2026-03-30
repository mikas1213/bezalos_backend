import express from 'express';
import { catchAsync } from '../../../common/utils/catchAsync';
import { validate } from '../../../common/middleware/validate';
import type { CommentsMiddleware } from './CommentsMiddleware';
import type { CommentsController } from './CommentsController';
import type { AuthMiddleware } from '../../auth/middleware/AuthMiddleware';
import { CommentsSchema } from './CommentsSchema';

export const createCommentsRouter = (
	authMiddleware: AuthMiddleware,
	commentsMiddleware: CommentsMiddleware,
	commentsController: CommentsController,
) => {
	const router = express.Router();

	router.post(
		'/',
		authMiddleware.protect({ required: true }),
		authMiddleware.isCourse({ required: false }),
		authMiddleware.isSubscription({ required: false }, 'virtuve', 'Virtuvė', 'Cancel_virtuve'),
		catchAsync(commentsMiddleware.canCommentVideo),
		validate(CommentsSchema),
		catchAsync(commentsController.postComment),
	);

	router.get('/:videoId', authMiddleware.protect({ required: false }), catchAsync(commentsController.getComments));

	router.delete('/:id', authMiddleware.protect({ required: true }), catchAsync(commentsController.deleteComment));

	return router;
};
