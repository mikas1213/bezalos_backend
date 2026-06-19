import express from 'express';
import { catchAsync } from '../../common/utils/catchAsync';
import { SeoController } from './SeoController';

export const createSeoRouter = (seoController: SeoController) => {
	const router = express.Router();
	router.get('/virtuve/:slug', catchAsync(seoController.getVideoMeta));
	router.get('/straipsniai/:slug', catchAsync(seoController.getArticleMeta));
	return router;
};
