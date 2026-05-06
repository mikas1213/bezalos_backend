import express from 'express';
import { roles } from '../../../common/config/roles';
import { catchAsync } from '../../../common/utils/catchAsync';
import { AuthMiddleware } from '../../auth/middleware/AuthMiddleware';
import { validateUUID } from '../../../common/middleware/validateUUID';
// import { uploadFiles, resizePhotoDisk } from '../../../common/middleware/MulterMiddleware';
import type { AdminVirtuveController } from './AdminVirtuveController';

export const adminCreateVirtuveRouter = (authMiddleware: AuthMiddleware, adminVirtuveController: AdminVirtuveController) => {
	const router = express.Router();
	router.use(authMiddleware.protect({ required: true }), authMiddleware.restrictTo(roles.admin));

	router.get('/', catchAsync(adminVirtuveController.getAllVideos));
	router.delete('/:id', validateUUID, catchAsync(adminVirtuveController.deleteVideo));
	// router.post(
	// 	'/',
	// 	uploadFiles,
	// 	resizePhotoDisk,
	// 	addVideoValidator.addVideoFormValidator,
	// 	addVideoValidator.addVideoFilesValidator,
	// 	videoController.addVideo,
	// );
	return router;
};
