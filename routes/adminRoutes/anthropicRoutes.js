const express = require('express');
const router = express.Router();
const anthropicController = require('../../controllers/adminControllers/anthropicController');

router.route('/').get(anthropicController.anthropicApi);

module.exports = router;