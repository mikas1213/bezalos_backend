const { body, validationResult } = require('express-validator');
const { ValidationError } = require('../../utils/errors');

const sanitizeCommentInput = [
    body('comment').isString().trim().notEmpty().withMessage('Komentaras negali būti tuščias').isLength({max: 1000}).withMessage('Galimas ne ilgesnis nei 1000 simbolių komentaras'),
    body('video_id').isString().notEmpty().withMessage('Reikalingas vaizdo įrašo ID'),
    body('user_name').isString().notEmpty().withMessage('Komentuoti gali tik registruoti vartotojai')
];

const validateCommentInput = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ValidationError(errors.array()[0].msg);
    }
    next();
};

module.exports = { sanitizeCommentInput, validateCommentInput };