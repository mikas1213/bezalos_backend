const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/servicesController');

router.route('/:slug').get(
    servicesController.getService
);
router.route('/').get(
    servicesController.getServices
);

module.exports = router;