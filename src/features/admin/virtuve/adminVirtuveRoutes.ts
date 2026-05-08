import express from 'express';
import { roles } from '../../../common/config/roles';
import { catchAsync } from '../../../common/utils/catchAsync';
import { AuthMiddleware } from '../../auth/middleware/AuthMiddleware';
import { AdminVideoMiddleware } from './AdminVideoMiddleware';
import { validateUUID } from '../../../common/middleware/validateUUID';
import { uploadFiles, resizePhotoDisk } from '../../../common/middleware/MulterMiddleware';
import type { AdminVirtuveController } from './AdminVirtuveController';

export const adminCreateVirtuveRouter = (
	authMiddleware: AuthMiddleware,
	adminVideoMiddleware: AdminVideoMiddleware,
	adminVirtuveController: AdminVirtuveController,
) => {
	const router = express.Router();
	router.use(authMiddleware.protect({ required: true }), authMiddleware.restrictTo(roles.admin));

	router.delete('/:id', validateUUID, catchAsync(adminVirtuveController.deleteVideo));
	router.post(
		'/:id',
		uploadFiles,
		resizePhotoDisk,
		validateUUID,
		catchAsync(adminVideoMiddleware.addVideoFormValidator),
		catchAsync(adminVirtuveController.updateVideo),
	);
	router.get('/', catchAsync(adminVirtuveController.getAllVideos));

	router.post(
		'/',
		uploadFiles,
		resizePhotoDisk,
		catchAsync(adminVideoMiddleware.addVideoFormValidator),
		catchAsync(adminVideoMiddleware.addVideoFilesValidator),
		catchAsync(adminVirtuveController.addVideo),
	);

	return router;
};
