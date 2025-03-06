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

const validateUUID_all = (req, res, next) => {
    const paramsUUIDs = req.params ? Object.values(req.params) : [];
    const bodyUUIDs = [];
    if (req.body) {
        ['id', 'user_id', 'video_id', 'plan_id', 'prod_id'].forEach(field => {
            if (req.body[field]) {
                bodyUUIDs.push(req.body[field]);
            }
        });
    }
    
    const allUUIDs = [...paramsUUIDs, ...bodyUUIDs].filter(id => id !== undefined);
    const invalidUUIDs = allUUIDs.filter(uuid => !validate(uuid));

    if (invalidUUIDs.length > 0) {
        return res.status(400).json({ 
            message: 'Neteisingas UUID formatas', 
            invalidUUIDs: invalidUUIDs 
        });
    }
    next();
};

module.exports = { validateUUID, validateUUIDs, validateUUID_all };