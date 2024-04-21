const db = require('../database/db');
const Email = require('../utils/email');
const { validationResult } = require('express-validator');

exports.addMail = async (req, res) => {
    const errors = validationResult(req);
    const { email } = req.body;
    
    try {
        if(!errors.isEmpty() && errors.errors[0].path === 'email') {
            return res.status(400).json({ errors: errors.errors });
        }
        const data = await db.query('SELECT id, email FROM mailer_list WHERE email = $1', [req.body.email]);

        if(data.rows.length) {
            return res.status(409).json({ errors: [{ msg:'Jūs jau prenumeruojate naujienlaiškį', path:'email' }] });
        }
        
        await db.query('INSERT INTO mailer_list(email) values($1)', [email]);
        // await new Email(email, '', '').sendNewsletter();

        res.status(201).json({
            status: 'success',
            message: 'Newsletter successfully subscribed!'
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
}