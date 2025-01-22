const express = require('express');
// const roles = require('../utils/roles');
const router = express.Router();
const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');
const { validateUUID, validateUUIDs } = require('../middleware/validators/validate_uuid');
const { sanitizeInput, xssProtection, validateSanitization } = require('../middleware/validators/anketaValidator');
const { sanitizeRecipeInputs, xssRecipeProtection, validateRecipeSanitization } = require('../middleware/validators/newRecipeValidator');
const {areAllFieldsEmpty, sanitizeBodyTrackingInput, validateBodyTrackingSanitization} = require('../middleware/validators/bodyTrackingValidator');

router.route('/products/:plan_id/:prod_id')
    .all(authController.protect,
        authController.isSubscription('profilis', 'virtuve', 'Profilis', 'Virtuvė')
    )
    .patch(validateUUIDs, profileController.updateProduct)

router.route('/anketa/:user_id')
    .all(authController.protect)
    .post(sanitizeInput, xssProtection, validateSanitization, profileController.submitAnketa);

router.route('/new-recipe/:id')
    .all(
        authController.protect, 
        authController.isSubscription('profilis', 'virtuve', 'Profilis', 'Virtuvė')
    )
    .post(sanitizeRecipeInputs, xssRecipeProtection, validateRecipeSanitization, profileController.saveNewRecipe)
    .delete(profileController.deleteRecipe)

router.route('/body-tracking/:id')
    .all(authController.protect, authController.isSubscription('profilis', 'virtuve', 'Profilis', 'Virtuvė'))
    .get(profileController.getBodyTracking)
    .post(areAllFieldsEmpty, sanitizeBodyTrackingInput, validateBodyTrackingSanitization, profileController.addBodyTracking)
    .delete(profileController.deleteBodyTracking)

router.route('/products')
    .all(authController.protect)
    .get(profileController.getAllProfileProducts);

router.route('/:id')
    .all(authController.protect)
    .get(validateUUID, profileController.getUserDetails);

module.exports = router;