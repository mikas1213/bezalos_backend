import express from 'express';
import type { TagsController } from './TagsController';
import { catchAsync } from '../../../common/utils/catchAsync';

export const createTagsRouter = (tagsController: TagsController) => {
	const router = express.Router();
	router.get('/virtuve', catchAsync(tagsController.getVirtuveFilters));
	return router;
};
