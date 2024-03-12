const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);


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