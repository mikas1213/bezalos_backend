const express = require('express');
// const roles = require('../utils/roles');
const router = express.Router();
const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');
const { validateUUID, validateUUIDs } = require('../middleware/validators/validate_uuid');
const { sanitizeInput, xssProtection, validateSanitization } = require('../middleware/validators/anketaValidator');

router.route('/products/:plan_id/:prod_id')
    .all(authController.protect,
        authController.isSubscription('profilis', 'virtuve', 'Virtuvė')
    )
    .patch(validateUUIDs, profileController.updateProduct)

router.route('/anketa/:user_id')
    .all(authController.protect)
    .post(sanitizeInput, xssProtection, validateSanitization, profileController.submitAnketa);

router.route('/products')
    .all(authController.protect,
        // authController.isSubscription('virtuve')
    )
    .get(profileController.getAllProfileProducts);

router.route('/:id')
    .all(authController.protect)
    .get(validateUUID, profileController.getUserDetails);

module.exports = router;