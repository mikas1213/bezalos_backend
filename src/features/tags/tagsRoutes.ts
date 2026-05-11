import express from 'express';
import { roles } from '../../common/config/roles';
import type { TagsController } from './TagsController';
import type { AuthMiddleware } from '../auth/middleware/AuthMiddleware';
import { catchAsync } from '../../common/utils/catchAsync';

export const createTagsRouter = (tagsController: TagsController, authMiddleware: AuthMiddleware) => {
	const router = express.Router();

	router.post('/', catchAsync(tagsController.getTags));

	router.use(authMiddleware.protect({ required: true }), authMiddleware.restrictTo(roles.admin));

	router.post('/tag', catchAsync(tagsController.addTag));
	router.delete('/tag', catchAsync(tagsController.deleteTag));

	return router;
};
