const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const videoController = require('../controllers/videoController');

router.route('/').get(
    // authController.protect, 
    videoController.getKitchenVideos
);

module.exports = router;