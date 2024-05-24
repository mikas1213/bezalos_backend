const db = require('../database/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const Email = require('../utils/email');
const queries = require('../utils/sqlQueries');
const { validationResult } = require('express-validator');

exports.signup = async (req, res) => {
    const errors = validationResult(req);
    const { name, email, initial_target, password } = req.body;
    
    try {
        if(!errors.isEmpty() && errors.errors[0].path === 'email') {
            // return res.status(400).json({ 'message': errors.errors[0].msg });
            return res.status(400).json({ errors: errors.errors });
        }
        const data = await db.query('SELECT id FROM users WHERE email = $1', [req.body.email]);

        if(data.rows.length) {
            // return res.status(409).json({message: 'Toks vartotojas jau yra'});
            return res.status(409).json({ errors: [{msg:'Toks vartotojas jau yra', path:'email'}] });
        }

        if(!errors.isEmpty() && errors.errors[0].path === 'password') {
            // return res.status(400).json({ message: errors.errors[0].msg });
            return res.status(400).json({ errors: errors.errors });
        }

        if(!errors.isEmpty() && errors.errors[0].path === 'passwordConfirmed') {
            // return res.status(400).json({ message: errors.errors[0].msg });
            return res.status(400).json({ errors: errors.errors });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.query('INSERT INTO users(name, email, initial_target, password) values($1, $2, $3, $4)', [name, email, initial_target, hashedPassword/*, new Date().toISOString(), new Date().toISOString()*/]);
        await new Email(email, initial_target, '').sendWelcome();

        res.status(201).json({
            status: 'success',
            message: 'New user successfully registered!'
        });
    } catch (err) {
        // console.log(errors)
        res.status(500).json({ msg: err.message });
    }
};

exports.login = async (req, res) => {
    
    try {
        const errors = validationResult(req);

        const { email, password } = req.body;
        // if(!errors.isEmpty()) return res.status(400).json({ message: errors.errors[0].msg});
        if(!errors.isEmpty()) return res.status(400).json({ errors: errors.errors });

        const user = await db.query('SELECT id, role, email, password, subscription_expires  FROM users WHERE email = $1', [email]);
        // if(!user.rows[0]) return res.status(401).json({message: "Netinkamas el. paštas arba slaptažodis!"}); 
        if(!user.rows[0]) return res.status(401).json({errors: [{path: 'auth', type: 'server', msg: 'Netinkamas el. paštas arba slaptažodis!'}]}); 
        
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        // if(!validPassword) return res.status(401).json({message: "Netinkamas el. paštas arba slaptažodis!"});
        if(!validPassword) return res.status(401).json({errors: [{path: 'auth', type: 'server', msg: 'Netinkamas el. paštas arba slaptažodis!'}]});
        
        const accessToken = jwt.sign({ 
            user_id: user.rows[0].id,
            user_name: user.rows[0].email,
            user_role: user.rows[0].role,
            user_subscription: Date.parse(user.rows[0].subscription_expires) > Date.now()
        }, process.env.ACCESS_TOKEN_SECRET, {
            // expiresIn: process.env.ACCESS_TOKEN_EXPIRES
            expiresIn: '10s'
        });

        const refreshToken = jwt.sign({ 
            user_id: user.rows[0].id,
            user_name: user.rows[0].email,
            user_role: user.rows[0].role,
            user_subscription: Date.parse(user.rows[0].subscription_expires) > Date.now()
        }, process.env.REFRESH_TOKEN_SECRET, {
            // expiresIn: user.rows[0].role == process.env.ADMIN_ROLE ? process.env.REFRESH_TOKEN_EXPIRES_LONG : process.env.REFRESH_TOKEN_EXPIRES
            expiresIn: '3d'
        });
        
        await db.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.rows[0].id]);
        res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, maxAge: 24 * 60 * 60 * 1000 });

        res.status(200).json({
            accessToken
        });
        
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.logout  = async (req, res) => {
    const cookies = req.cookies;
    
    if(!cookies.jwt) return res.sendStatus(204); // No content
    
    const refreshToken = cookies.jwt;
    const user = await db.query('SELECT id, "refresh_token" FROM users WHERE "refresh_token" = $1', [refreshToken]);
    
    if(!user.rows[0]) {        
        res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'None' });
        return res.sendStatus(204);
    }

    await db.query('UPDATE "users" SET "refresh_token" = $1 WHERE "id" = $2', [null, user.rows[0].id]);
    res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'None' });
    res.sendStatus(204);
}

exports.forgotPassword = async (req, res) => {
    try {
        // I - Get suer based on POSTed email
        const user = await db.query('SELECT email FROM users WHERE email = $1', [req.body.email]);
        if(!user.rows.length) {
            return res.status(404).json({
                errors: [{
                    path: 'auth', 
                    type: 'server', 
                    msg: 'Toks vartotojas sistemoje nerastas'
                }]
            });
        }
        
        // II - Generate the random reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // III - Encrypt resetToken
        const encryptedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // IV - Save encryptedToken for user to databaseuser and save password_reset_expires date
        await db.query('UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE email = $3', [encryptedToken, (new Date(Date.now()+10*60*1000).toISOString()), req.body.email]);

        // V - Send rest url to user's email
        const resetUrl = `${req.protocol}://${req.get('host')}/keisti-slaptazodi/${resetToken}`;
        await new Email(user.rows[0].email, '', resetUrl).sendForgotPassword();
        // console.log(resetUrl);

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
        
    } catch (err) {
        await db.query('UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE email = $3', [null, null, req.body.email]);
        res.status(500).json({
            message: err.message
        });
    }
};

exports.resetPassword = async (req, res) => {
    
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await db.query('SELECT email FROM users WHERE "password_reset_token" = $1 AND password_reset_expires > $2', [hashedToken, new Date(Date.now()).toISOString()]);
    
    if(!user.rows.length) {
        return res.status(500).json({
            status: 'error',
            message: 'Nuoroda neteisinga, arba nebegaliojanti.'
        });
    }

    res.json({data: user.rows[0]});
};

exports.updatePassword = async (req, res, next) => {
    const errors = validationResult(req);
    
    // I Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await db.query('SELECT email FROM users WHERE "password_reset_token" = $1 AND password_reset_expires > $2', [hashedToken, new Date(Date.now()).toISOString()]);
    if(!user.rows.length) {
        return res.status(400).json({
            status: 'error',
            message: 'Nuoroda neteisinga, arba nebegaliojanti.'
        });
    }

    if(!errors.isEmpty() && errors.errors[0].path === 'password') {
        return res.status(400).json({ message: errors.errors[0].msg });
    }

    if(!errors.isEmpty() && errors.errors[0].path === 'passwordConfirmed') {
        return res.status(400).json({ message: errors.errors[0].msg });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    await db.query(queries.resetPasswordUpdate, [hashedPassword, null, null, user.rows[0].email]);
    
    res.status(200).json({
        status: 'Success',
        message: 'Slaptažodis sėkmingai pakeistas.'
    });

    // II If token has not expired, and there is user, set the NEW password

    // III Update changePasswordAt property for user in DB

    // IV Log the user in, setn JWT
    
};

exports.refresh = async (req, res) => {
    const cookies = req.cookies;    
    if(!cookies?.jwt) return res.sendStatus(401);

    const refreshToken = cookies.jwt;
    const user = await db.query('SELECT id, "refresh_token" FROM users WHERE "refresh_token" = $1', [refreshToken]);
    
    if(!user.rows[0]) return res.sendStatus(403); // Forbidden

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
        
            if(err || user.rows[0].id !== decoded.user_id) return res.sendStatus(403);
            const accessToken = jwt.sign({ 
                user_id: decoded.user_id,
                user_name: decoded.user_name,
                user_role: decoded.user_role,
                user_subscription: decoded.user_subscription
            }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES});
            res.json({ accessToken });
        }
    );
}

exports.protect = (req, res, next) => {
    
    const authHeader = req.headers['authorization'] || req.headers.Authorization;
    if(!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    
    const token = authHeader.split(' ').pop();
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {

        if(err) return res.sendStatus(403);
        
        req.user_id = decoded.user_id;
        req.user_name = decoded.user_name;
        req.user_role = decoded.user_role;
        req.user_subscription = decoded.user_subscription;
        next();
    });
};

exports.isSubscription = (req, res, next) => {
    if(!req.user_subscription) return res.sendStatus(402);
    next();
};

exports.verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if(!req.user_role) return res.sendStatus(401);
        if(!allowedRoles.includes(req.user_role)) return res.sendStatus(401);
        next();
    }
}