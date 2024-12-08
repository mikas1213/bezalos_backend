const { body, validationResult } = require('express-validator');
const xss = require('xss');

const sanitizeRecipeInputs = [
    body('title').trim().notEmpty().withMessage('Neįrašytas recepto pavadinimas').isLength({max: 100}).withMessage('Galimas ne ilgesnis nei 100 simbolių pavadinimas'),
    body('logic').trim().isLength({max: 3}).withMessage('Recepto maistinių medžiagų logika netinkama'),
    body('products').customSanitizer(products => {
        return products.map(prod => {
            const sanitizedProd = {...prod};
            for(let key in sanitizedProd) {
                if(typeof sanitizedProd[key] === 'string') {
                    sanitizedProd[key] = xss(sanitizedProd[key])
                }
                if(key === 'grams') {
                    sanitizedProd[key] = +sanitizedProd[key]
                }
            }
            return sanitizedProd;
        })
    }).custom(products => {

        if(!products.length) {
            throw new Error('Nepridėtas nei vienas produktas');
        } else {
            return products.map(prod => {
                if(isNaN(prod.grams)) throw new Error('Galima vesti tik skaičius');
            });
        }
    })
];

const xssRecipeProtection = (req, res, next) => {
    if (req.body) {
        for (let key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = xss(req.body[key]);
            }
        }
    }
    next();
};

const validateRecipeSanitization = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({             
            message: errors.errors[0].msg
        });
    }
    next();
};

module.exports = { sanitizeRecipeInputs, xssRecipeProtection, validateRecipeSanitization };