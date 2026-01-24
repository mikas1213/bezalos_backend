import express from 'express';
import { catchAsync } from '../../../common/utils/catchAsync';
import { AuthController } from '../controller/AuthController';
import { validate } from '../../../common/middleware/validate';
import { LoginSchema } from '../schemas';

export const createAuthRouter = (authController: AuthController) => {
	const router = express.Router();

	router.post('/login', validate(LoginSchema), catchAsync(authController.login));
    router.get('/refresh', catchAsync(authController.refresh));
    router.get('/logout', catchAsync(authController.logout));

	return router;
};
