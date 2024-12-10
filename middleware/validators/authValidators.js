const { body } = require('express-validator');
// npm i tlds
// const tlds = require("tlds");
const signupValidator = [
    body('name').isLength({max: 24}).withMessage('Vardas yra per ilgas'),
    body('email').notEmpty().withMessage('Neįvestas el. paštas'),
    body('email', 'Neteisingai įvestas el. pašto adresas').isEmail(),
    // body('email').matches(/((\w+\.)*\w+)@(\w+\.)+(com|kr|net|us|info|biz)/).withMessage('test'),
    body('password').notEmpty().withMessage('Neįvestas slaptažodis'),
    body('password').isLength({min: 8}).withMessage('Slaptažodis turi būti ne trumpesnis nei 8 simboliai'),
    body('password').matches(/[0-9]+/g).withMessage('Slaptažodį turi sudaryti bent vienas skaičius'),
    body('password').matches(/[A-Z]+/gi).withMessage('Slaptažodį turi sudaryti bent viena raidė'),
    body('passwordConfirmed').notEmpty().withMessage('Pakartokite slaptažodį'),
    body('passwordConfirmed').custom((value, {req}) => value === req.body.password).withMessage('Slaptažodis nesutampa')
];

const loginValidator = [
    body('email').notEmpty().withMessage('Neįvestas el. paštas'),
    body('password').notEmpty().withMessage('Neįvestas slaptažodis')
];

const resetPasswordValidator = [
    body('password').notEmpty().withMessage('Neįvestas slaptažodis'),
    body('password').isLength({min: 8}).withMessage('Slaptažodis turi būti ne trumpesnis nei 8 simboliai'),
    body('password').matches(/[0-9]+/g).withMessage('Slaptažodį turi sudaryti bent vienas skaičius'),
    // body('password').matches(/[A-Z]+/g).withMessage('Slaptažodį turi sudaryti bent viena didžioji raidė'),
    body('passwordConfirmed').notEmpty().withMessage('Pakartokite slaptažodį'),
    body('passwordConfirmed').custom((value, {req}) => value === req.body.password).withMessage('Slaptažodis nesutampa')
];

module.exports = { loginValidator, signupValidator, resetPasswordValidator };

