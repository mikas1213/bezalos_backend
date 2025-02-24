const roles = require('../utils/roles');
const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/servicesController');

router.route('/:slug').get(
    servicesController.getOneService
);

router.route('/').get(
    servicesController.getAllServices
);

module.exports = router;