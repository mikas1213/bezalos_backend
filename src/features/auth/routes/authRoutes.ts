// const express = require('express');
// const router = express.Router();
// const authController = require('../controllers/authController');

import express from 'express';
const router = express.Router();
import { login } from '../controller/AuthController';
// const { signupValidator, loginValidator, resetPasswordValidator } = require('../middleware/validators/authValidators');
console.log('labas')
router.route('/login').post(login);
// router.route('/signup').post(signupValidator, authController.signup);
// router.route('/login').post(loginValidator, authController.login);
// router.route('/logout').get(authController.logout);
// router.route('/refresh').get(authController.refresh);
// router.route('/forgot-password').post(authController.forgotPassword);
// router.route('/reset-password/:token')
//     .get(authController.resetPassword)
//     .patch(resetPasswordValidator, authController.updatePassword);
    
export default router;