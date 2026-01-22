import express from 'express';
import { catchAsync } from '../../../common/utils/catchAsync';
import { AuthController } from '../controller/AuthController';

export const createAuthRouter = (authController: AuthController) => {
  const router = express.Router();

  router.post('/login', catchAsync(authController.login));
  // router.route('/login').post(loginValidator, authController.login);

  return router;
};
