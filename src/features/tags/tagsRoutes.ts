import express from 'express';
import type { TagsController } from './TagsController';
import { catchAsync } from '../../common/utils/catchAsync';

export const createTagsRouter = (tagsController: TagsController) => {
	const router = express.Router();
	router.post('/', catchAsync(tagsController.getTags));
	return router;
};
