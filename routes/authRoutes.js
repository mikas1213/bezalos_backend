const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { signupValidator, loginValidator, resetPasswordValidator } = require('../middleware/validators/authValidators');

router.route('/signup').post(signupValidator, authController.signup);
router.route('/login').post(loginValidator, authController.login);
router.route('/logout').get(authController.logout);
router.route('/refresh').get(authController.refresh);
router.route('/forgot-password').post(authController.forgotPassword);
router.route('/reset-password/:token').patch(resetPasswordValidator, authController.resetPassword);




// router.post('/signup', authController.test, authController.signup);
// router.route('/virtuve').get(authController.getVirtuve);


// router.post('/signup', authController.signup);
// router.post('/login', authController.login);
// router.get('/logout', authController.logout);

// router
//   .route('/')
//   .get(userController.getAllUsers)
//   .post(userController.createUser);
module.exports = router;