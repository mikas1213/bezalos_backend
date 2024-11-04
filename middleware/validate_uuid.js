const { validate } = require('uuid');

const validateUUID = (req, res, next) => {

    const uuid = req.params.id;
    if(!validate(uuid)) {
        return res.status(400).json({ message: 'Neteisingas UUID formatas' });
    }
    next();
};

const validateUUIDs = (req, res, next) => {
    let { plan_id, prod_id } = req.params;
    const allValid = [plan_id, prod_id].every(uuid => validate(uuid));
    if(!allValid) {
        return res.status(400).json({ message: 'Neteisingas UUID formatas' });
    }
    next();
};

module.exports = { validateUUID, validateUUIDs };