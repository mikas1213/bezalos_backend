const { body, validationResult } = require('express-validator');

const areAllFieldsEmpty = (req, res, next) => {

    const fields = ['svoris', 'bicepsas', 'talija', 'sedmenys', 'slaunis'];
    const is_empty = fields.every(field => !req.body[field]?.trim());
    
    if(is_empty) {
        return res.status(400).json({
            errors: [{path: 'all', msg: 'Bent vienas laukelis turi būti užpildytas'}]
        });
    }
    next();
};


const valid_field = field => {
    
    let chain = body(field).trim()
        .if(value => !!value)
        .customSanitizer(value => value.replace(',', '.'))
        .isFloat().withMessage('Galimi tik skaičiai')
        .isLength({max: 5}).withMessage('Daugiausiai 5 skaitmenys')
        .toFloat()
        // .customSanitizer(value => (value === !value ? null : value))

    return chain;
};

const sanitizeBodyTrackingInput = [
    valid_field('svoris'),
    valid_field('bicepsas'),
    valid_field('talija'),
    valid_field('sedmenys'),
    valid_field('slaunis')
]

const validateBodyTrackingSanitization = (req, res, next) => {
    
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }
    next();
};

module.exports = { areAllFieldsEmpty, sanitizeBodyTrackingInput, validateBodyTrackingSanitization };