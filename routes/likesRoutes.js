const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const likesController = require('../controllers/likesController');

router.use(authController.protect);
router
	.route('/video')
	.post(authController.isSubscription('virtuve', 'Virtuvė'), likesController.likesToggle);

router.route('/recipe').post(likesController.likesToggle);

module.exports = router;
