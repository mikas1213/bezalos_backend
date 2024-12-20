const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/servicesController');

router.route('/').get(
    servicesController.getAllServices
);

router.route('/:slug').get(
    servicesController.getOneService
);

module.exports = router;