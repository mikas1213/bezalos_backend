const db = require('../database/db');
const Email = require('../utils/email');
const { validationResult } = require('express-validator');

exports.subscribeNewsletter = async (req, res) => {
    const errors = validationResult(req);
    const { email } = req.body;
    
    try {
        if(!errors.isEmpty() && errors.errors[0].path === 'email') {
            return res.status(400).json({ errors: errors.errors });
        }

        await db.query('BEGIN');
        let result = await db.query(`
            INSERT INTO emails (email) VALUES ($1)
            ON CONFLICT (email) DO UPDATE 
            SET updated_at = CURRENT_TIMESTAMP
            RETURNING id, email
        `, [email]);
        
        const emailId = result.rows[0].id;

        const data = await db.query(`
            SELECT id FROM email_sources
            WHERE email_id = $1 AND email_source = 'subscriber'
        `, [emailId]);

        if(data.rows.length > 0) {
            await db.query('ROLLBACK');
            return res.status(409).json({ errors: [{ msg:'Jūs jau prenumeruojate naujienlaiškį', path:'email' }] });
        }

        await db.query(`
            INSERT INTO email_sources (email_id, email_source)
            VALUES ($1, 'subscriber')
        `, [emailId]);
        
        await db.query('COMMIT');
        await new Email(email, '', '').sendNewsletter();

        res.status(201).json({
            status: 'success',
            message: 'Newsletter successfully subscribed!'
        });
    } catch (err) {
        await db.query('ROLLBACK');
        res.status(500).json({ msg: err.message });
    } 
}

exports.submitNutritionTest = async (req, res) => {
    const errors = validationResult(req);
    const { check, email } = req.body;
    
    try {
        if(!errors.isEmpty() && errors.errors[0].path === 'email') {
            return res.status(400).json({ errors: errors.errors });
        }

        if(!check) {
            return res.status(400).json({ errors: [{ msg:'Būtina pažymėti varnytę', path:'check' }] });
        }
        
        await db.query('BEGIN');
        
        const emailResult = await db.query(`
            INSERT INTO emails(email) VALUES ($1)
            ON CONFLICT (email) DO UPDATE 
            SET updated_at = CURRENT_TIMESTAMP
            RETURNING id
        `, [email]);

        const emailId = emailResult.rows[0].id;
        
        await db.query(`
            INSERT INTO email_sources (email_id, email_source)
            VALUES ($1, 'test')
            ON CONFLICT (email_id, email_source) 
            DO UPDATE SET updated_at = CURRENT_TIMESTAMP
        `, [emailId]);

        await db.query('COMMIT');

        res.status(201).json({
            status: 'success',
            message: 'Your results are here!'
        });
    } catch (err) {
        await db.query('ROLLBACK');
        res.status(500).json({ msg: err.message });
    } 
}

exports.sendOfferMail = async (req, res) => {
    const errors = validationResult(req);
    const { email } = req.body;
    const today = new Date();
    today.setDate(today.getDate() + 30);

    try {
        

        if(!errors.isEmpty() && errors.errors[0].path === 'email') {
            return res.status(400).json({ errors: errors.errors });
        }
        
        db.query('BEGIN');
        const settings = await db.query('SELECT offer_video_url FROM SETTINGS LIMIT 1');
        const video = settings.rows[0].offer_video_url;

        const data = await db.query(`
            SELECT * FROM emails WHERE email = $1 
            AND expires_at > CURRENT_TIMESTAMP
            AND video_url = $2
            ORDER BY created_at DESC LIMIT 1
        `, [email, video]);

        if(data.rows.length > 0) {
            await db.query('ROLLBACK');
            return res.status(409).json({ errors: [{ msg:'Jūs jau pasinaudojote pasiūlymu', path:'email' }] });
        }

        const offerResult = await db.query(`
            INSERT INTO emails (email, video_url, expires_at)
            VALUES ($1, $2, $3)
            ON CONFLICT (email) 
            DO UPDATE SET 
                video_url = $2,
                expires_at = $3,
                updated_at = CURRENT_TIMESTAMP
            RETURNING id
        `, [email, video, today.toISOString()]);

        const emailId = offerResult.rows[0].id;

        await db.query(`
            INSERT INTO email_sources (email_id, email_source)
            VALUES ($1, 'offer')
            ON CONFLICT (email_id, email_source) 
            DO UPDATE SET updated_at = CURRENT_TIMESTAMP
        `, [emailId]);

        await db.query('COMMIT');
        await new Email(email, 'offer', video).sendOffer();

        res.status(201).json({
            status: 'success',
            message: 'Offer successfully sent!'
        });
    } catch (err) {
        await db.query('ROLLBACK');
        res.status(500).json({ msg: err.message });
    }
}


// exports.sendOfferMail_original = async (req, res) => {
//     const errors = validationResult(req);
//     const { email } = req.body;
//     const video = 'https://youtu.be/vWWaFLEDDzI';
//     const today = new Date();
//     today.setDate(today.getDate() + 30);

//     try {
//         if(!errors.isEmpty() && errors.errors[0].path === 'email') {
//             return res.status(400).json({ errors: errors.errors });
//         }

//         const data = await db.query('SELECT email, video, expires_to FROM offers WHERE email = $1', [email]);
        
//         if(data.rows.length) {
            
//             if(video === data.rows[0].video && Date.parse(data.rows[0].expires_to) > Date.now()) {
//                 return res.status(409).json({ errors: [{ msg:'Jūs jau pasinaudojote pasiūlymu', path:'email' }] });
//             } else {
//                 await db.query('UPDATE offers SET video = $1, expires_to = $2 WHERE email = $3', [video, today.toISOString(), email]);
//             }
            
//         } else {
//             await db.query('INSERT INTO offers(email, video, expires_to) values($1, $2, $3)', [email, video, today.toISOString()]);
//             await new Email(email, 'offer', video).sendOffer();
//         }

//         res.status(201).json({
//             status: 'success',
//             message: 'Offer successfully sent!'
//         });
//     } catch (err) {
//         res.status(500).json({ msg: err.message });
//     }
// }