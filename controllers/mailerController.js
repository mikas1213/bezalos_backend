const db = require('../database/db');
const Email = require('../utils/email');
const { validationResult } = require('express-validator');

exports.addMailToMailerList = async (req, res) => {
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
        await new Email(email, '', '').sendNewsletter();

        res.status(201).json({
            status: 'success',
            message: 'Newsletter successfully subscribed!'
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
}

exports.sendOfferMail = async (req, res) => {
    const errors = validationResult(req);
    const { email } = req.body;
    // const video = 'https://youtu.be/7AyRYZ6oKb8';
    const video = 'https://youtu.be/w8G1KrQilbs';
    const today = new Date();
    today.setDate(today.getDate() + 30);

    try {
        if(!errors.isEmpty() && errors.errors[0].path === 'email') {
            return res.status(400).json({ errors: errors.errors });
        }

        const data = await db.query('SELECT email, video, expires_to FROM offers WHERE email = $1', [email]);
        
        if(data.rows.length) {
            
            if(video === data.rows[0].video && Date.parse(data.rows[0].expires_to) > Date.now()) {
                return res.status(409).json({ errors: [{ msg:'Jūs jau pasinaudojote pasiūlymu', path:'email' }] });
            } else {
                await db.query('UPDATE offers SET video = $1, expires_to = $2 WHERE email = $3', [video, today.toISOString(), email]);
            }
            
        } else {
            await db.query('INSERT INTO offers(email, video, expires_to) values($1, $2, $3)', [email, video, today.toISOString()]);
            await new Email(email, 'offer', video).sendOffer();
        }

        res.status(201).json({
            status: 'success',
            message: 'Offer successfully sent!'
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
}