import express from 'express';
import { catchAsync } from '../../../common/utils/catchAsync';
import { AuthController } from '../controller/AuthController';
import { LoginRateLimiter } from '../middleware/LoginRateLimiter';
import { SignupRateLimiter } from '../middleware/SignupRateLimiter';
import { validate } from '../../../common/middleware/validate';
import { LoginSchema, SignupSchema, ForgotPasswordSchema, UpdatePasswordSchema } from '../schemas';

export const createAuthRouter = (
	authController: AuthController,
	loginRateLimiter: LoginRateLimiter,
	signupRateLimiter: SignupRateLimiter,
) => {
	const router = express.Router();

	router.post('/signup', validate(SignupSchema), signupRateLimiter.middleware(), catchAsync(authController.signup));
	router.post('/login', validate(LoginSchema), loginRateLimiter.middleware(), catchAsync(authController.login));
	router.get('/refresh', catchAsync(authController.refresh));
	router.post('/logout', catchAsync(authController.logout));
	router.post('/forgot-password', validate(ForgotPasswordSchema), catchAsync(authController.forgotPassword));
	router.get('/reset-password/:token', catchAsync(authController.validateResetToken));
	router.patch('/reset-password/:token', validate(UpdatePasswordSchema), authController.updatePassword);

	return router;
};
