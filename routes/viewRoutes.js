const express = require('express');
const router = express.Router();
const viewsController = require('../controllers/viewsController');

router.route('/').get(viewsController.getHomepage);
router.route('/virtuve').get(viewsController.getVirtuve);

module.exports = router;