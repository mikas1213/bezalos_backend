const { body, validationResult } = require('express-validator');
const xss = require('xss');

const limits = {
    age: 4,
    height: 4,
    weight: 7,
    activity_steps: 7,
    feeding_desc: 200,
    health_problems_desc: 500,
    diet_desc: 1000, 
    intolerance_desc: 200,  
    breakfast_desc: 500, 
    lunch_desc: 500, 
    snack_desc: 500, 
    dinner_desc: 500, 
    additional_info: 3000
}

const valid_num = (field, maxLength, errorMsg = '') => {
    let chain = body(field)
        .trim()
        .notEmpty().withMessage({ error: errorMsg, page: 1})
        .customSanitizer(value => value.replace(',', '.'))
        .custom(value => {
            if(isNaN(value)) {
                throw {error: 'Galimi tik skaičiai', page: 1}
            }
            if(value < 0) {
                throw {error: 'Galimi tik teigiami skaičiai', page: 1}
            }
            return true;
        })
        .toFloat();


    return chain.isLength({ max: maxLength }).withMessage({error: `Skaičius turi būti neilgesnis nei: ${maxLength}`, page: 1});
};

const valid_time = (field, field_2, page) => {
    return body(field)
        .trim()
        .isLength({ max: 5 })
        .escape()
        .custom((value, { req }) => !(value.indexOf('--') > -1) || req.body[field_2])
        .withMessage({error: `Nepasirinkta`, page });
};

const valid_desc = (field, maxLength, field_2, page) => {
    let chain = body(field)
        .trim()
        .isLength({ max: maxLength })
        .escape()
        .custom((value, { req }) => !(req.body[field_2] && value.length === 0))
        .withMessage({error: `Trūksta informacijos`, page });
    return chain;
};

const valid_meal_desc = (field, maxLength, field_2, page) => {
    let chain = body(field)
        .trim()
        .isLength({ max: maxLength })
        .escape()
        .custom((value, { req }) => req.body[field_2] || (!req.body[field_2] && value.length > 0))
        .withMessage({error: `Trūksta informacijos`, page });
    return chain;
};

const gali_negali = {
    'Galiu valgyti betkada': ['get_up', 'go_sleep'],
    'Negaliu valgyti betkada': ['get_up', 'go_sleep', 'breakfast_time', 'lunch_time', 'snack_time', 'dinner_time']
};

const valid_routine = (field, page) => {
    return body(field)
        .custom(routines => {
            const is_err = routines.some(routine => {
                gali_negali[routine.eat].some(key => {
                    if(routine[key].indexOf('--') > -1) {
                        throw {
                            error: {[key]: 'Nepasirinkta'},
                            page: 6,
                            field: key,
                            id: `${key}_`+routine.day_id,
                        }
                    }
                });
            });
        return !is_err;
    });
};

const sanitizeInput = [
    /* PAGE 1 */
    body('gender').trim().custom(value => value === 'Moteris' || value === 'Vyras').escape(),
    valid_num('age', limits.age, 'Neįvestas amžius'),
    valid_num('height', limits.height, 'Neįvestas ūgis'),
    valid_num('weight', limits.weight, 'Neįvestas svoris'),
    valid_num('activity_steps', limits.activity_steps, 'Neįvestas aktyvumas'),

    /* PAGE 2 */
    body('goal').trim().notEmpty().withMessage({error: 'Nepasirinktas tikslas', page: 2}).isLength({max: 50}).escape(),

    /* PAGE 3 */
    body('schedule').trim().notEmpty().withMessage({error: 'Nepasirinktas darbo grafikas', page: 3}).isLength({max: 100}).escape(),
    body('feeding').toBoolean(),
    valid_desc('feeding_desc', limits.feeding_desc, 'feeding', 3),

    /* PAGE 4 */
    body('health_problems').toBoolean(),
    valid_desc('health_problems_desc', limits.health_problems_desc, 'health_problems', 4),

    /* PAGE 5 */
    body('diet').toBoolean(),
    valid_desc('diet_desc', limits.diet_desc, 'diet', 5),

    body('intolerance').toBoolean(),
    valid_desc('intolerance_desc', limits.intolerance_desc, 'intolerance', 5),

    body('breakfast').toBoolean(),
    valid_time('breakfast_time', 'breakfast', 5),
    valid_meal_desc('breakfast_desc', limits.breakfast_desc, 'breakfast', 5),

    body('lunch').toBoolean(),
    valid_time('lunch_time', 'lunch', 5),
    valid_meal_desc('lunch_desc', limits.lunch_desc, 'lunch', 5),

    body('snack').toBoolean(),
    valid_time('snack_time', 'snack', 5),
    valid_meal_desc('snack_desc', limits.snack_desc, 'snack', 5),

    body('dinner').toBoolean(),
    valid_time('dinner_time', 'dinner', 5),
    valid_meal_desc('dinner_desc', limits.dinner_desc, 'dinner', 5),

    /* PAGE 6 */
    valid_routine('routines.workday', 6),
    valid_routine('routines.day_off', 6),
    body('routines').customSanitizer(value => JSON.stringify(value)),
    
    /* PAGE 7 */
    body('nadditional_info').trim().isLength({max: limits.additional_info}).escape()
];

const xssProtection = (req, res, next) => {
    if (req.body) {
        for (let key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = xss(req.body[key]);
            }
        }
    }
    next();
};

const validateSanitization = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const { id } = errors.errors[0].msg;
        return res.status(400).json({             
            message: errors.errors[0].msg.error,
            page: errors.errors[0].msg.page,
            field: id || errors.errors[0].path
        });
    }
    next();
};

module.exports = { sanitizeInput, xssProtection, validateSanitization };