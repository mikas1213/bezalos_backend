const express = require('express');
const router = express.Router();
const sitemapController = require('../controllers/sitemapController');

router.route('').get(sitemapController.getSitemap);

module.exports = router;
