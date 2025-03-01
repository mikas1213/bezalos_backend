const express = require('express');
const router = express.Router();
const roles = require('../../utils/roles');
const authController = require('../../controllers/authController');
const adminControllers = require('../../controllers/adminControllers/adminController'); 
const adminPromotionsControllers = require('../../controllers/adminControllers/adminPromotionsController');
const { uploadData } = require('../../controllers/multerDataController');
const { promoFormValidator } = require('../../middleware/validators/addPromotionValidator');
const { validateUUID } = require('../../middleware/validators/validate_uuid');

router.use(authController.protect, authController.verifyRoles(roles.admin));
router.route('/promo/add')
    .post(
        uploadData, 
        promoFormValidator, 
        adminPromotionsControllers.addPromoCode
    );

router.route('/promo/:id')
    .delete(validateUUID, adminControllers.deleteOneRow('promotions'));

router.route('/promo').get(adminPromotionsControllers.getPromoCodes);

module.exports = router;