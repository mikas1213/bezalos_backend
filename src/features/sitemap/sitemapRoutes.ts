import express from 'express';
import type { SitemapController } from './SitemapController';
import { catchAsync } from '../../common/utils/catchAsync';

export const createSitemapRouter = (sitemapController: SitemapController) => {
	const router = express.Router();
	router.get('', catchAsync(sitemapController.getSitemap));
	return router;
};
