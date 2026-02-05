import express from 'express';
import { catchAsync } from '../../../common/utils/catchAsync';
import { AuthController } from '../controller/AuthController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { validate } from '../../../common/middleware/validate';
import { 
    LoginSchema,
    SignupSchema,
    ForgotPasswordSchema,
    UpdatePasswordSchema
 } from '../schemas';

export const createAuthRouter = (authController: AuthController, authMiddleware: AuthMiddleware) => {
	const router = express.Router();

    router.post('/signup', validate(SignupSchema), catchAsync(authController.signup));
	router.post('/login', validate(LoginSchema), catchAsync(authController.login));
    router.get('/refresh', catchAsync(authController.refresh));
    router.get('/me', authMiddleware.protect({ required: false }), catchAsync(authController.me));
    router.post('/logout', catchAsync(authController.logout));
    router.post('/forgot-password', validate(ForgotPasswordSchema), catchAsync(authController.forgotPassword));
    router.get('/reset-password/:token', catchAsync(authController.validateResetToken));
    router.patch('/reset-password/:token', validate(UpdatePasswordSchema), authController.updatePassword);

	return router;
};
