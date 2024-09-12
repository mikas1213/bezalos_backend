const { body } = require('express-validator');

const addProductValidators = [
    body('title').notEmpty().withMessage('Neįvestas pavadinimas'),
    body('proteins').notEmpty().withMessage('Neįvesti baltymai'),
    body('carbs').notEmpty().withMessage('Neįvesti angliavandeniai'),
    body('fat').notEmpty().withMessage('Neįvesti riebalai'),
    body('category').notEmpty().withMessage('Nepasirinkta kategorija'),
    body('sub_category').notEmpty()
    // .optional({ nullable: false, checkFalsy: false })
    .withMessage('Nepasirinkta subkategorija')
];

module.exports = { addProductValidators };