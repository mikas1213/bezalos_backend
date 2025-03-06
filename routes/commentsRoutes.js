const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');    
const commentsController = require('../controllers/commentsController');
const { sanitizeCommentInput, validateCommentInput } = require('../middleware/validators/addCommentValidator');
const { validateUUID_all } = require('../middleware/validators/validate_uuid');

router.route('/add').post(
    authController.protect,
    authController.isSubscription('virtuve', 'Virtuvė'),
    sanitizeCommentInput,
    validateCommentInput,
    validateUUID_all,
    commentsController.addComment
);

router.route('/:id').delete(
    authController.protect,
    authController.isSubscription('virtuve', 'Virtuvė'),
    commentsController.deleteComment
);

module.exports = router;