const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const mailerValidator = [
    body('email').notEmpty().withMessage('Neįvestas el. paštas'),
    body('email', 'Neteisingai įvestas el. pašto adresas').isEmail(),
];

const mailerController = require('../controllers/mailerController');
router.route('/test-results').post(mailerValidator, mailerController.submitNutritionTest);
router.route('/add').post(mailerValidator, mailerController.subscribeNewsletter);
router.route('/send-offer').post(mailerValidator, mailerController.sendOfferMail);

module.exports = router;