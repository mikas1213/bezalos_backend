const db = require('../database/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const Email = require('../utils/email');
const { validationResult } = require('express-validator');

// signup
/*
exports.signup = async (req, res) => {
    const errors = validationResult(req);
    const { name, email, initial_target, password } = req.body;
    
    try {
        if(!errors.isEmpty() && errors.errors[0].path === 'email') {
            return res.status(400).json({ errors: errors.errors });
        }
        const data = await db.query('SELECT id FROM users WHERE email = $1', [req.body.email]);

        if(data.rows.length) {
            return res.status(409).json({ errors: [{msg:'Toks vartotojas jau yra', path:'email'}] });
        }

        if(!errors.isEmpty() && errors.errors[0].path === 'password') {
            return res.status(400).json({ errors: errors.errors });
        }

        if(!errors.isEmpty() && errors.errors[0].path === 'passwordConfirmed') {
            return res.status(400).json({ errors: errors.errors });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.query('INSERT INTO users(name, email, initial_target, password) values($1, $2, $3, $4)', [name, email, initial_target, hashedPassword]);
        await new Email(email, initial_target, '').sendWelcome();

        res.status(201).json({
            status: 'success',
            message: 'New user successfully registered!'
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
*/
// login
/*
exports.login = async (req, res) => {
    console.log("IP:", req.ip);
    console.log("Forwarded:", req.headers['x-forwarded-for']);
    console.log("Real:", req.headers['x-real-ip']);

    
    try {
        const errors = validationResult(req);

        const { email, password } = req.body;
        if(!errors.isEmpty()) return res.status(400).json({ errors: errors.errors });

        const user = await db.query('SELECT users.id, stripe_customer_id, role, email, password, subscription_expires, subscription_type AS u_status, s.status AS s_status, s.current_period_end AS s_subscription_expires FROM users LEFT JOIN subscriptions as s ON s.user_id = users.id WHERE email = $1', [email]);
        if(!user.rows[0]) return res.status(401).json({errors: [{path: 'auth', type: 'server', msg: 'Netinkamas el. paštas arba slaptažodis!'}]}); 
        
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if(!validPassword) return res.status(401).json({errors: [{path: 'auth', type: 'server', msg: 'Netinkamas el. paštas arba slaptažodis!'}]});

        const { rows: [user_order] } = await db.query(`SELECT o.id, o.created_at, s.title,
            CASE 
                WHEN o.created_at IS NULL THEN false
                WHEN (CURRENT_TIMESTAMP - o.created_at) <= INTERVAL '90 days' THEN true
                    ELSE false
                END AS is_course
            FROM orders AS o
            LEFT JOIN services AS s ON s.id = o.service_id
            WHERE o.user_id = $1 AND s.category = 'Kursai' 
            ORDER BY o.created_at DESC 
            LIMIT 1`, [user.rows[0].id]);
        
        const today = Date.parse(new Date().toLocaleString('lt-LT', {dateStyle: 'short'}));
        const subs_exp = Date.parse(new Date(user.rows[0].subscription_expires).toLocaleString('lt-LT', {dateStyle: 'short'}));
        const s_subs_exp = Date.parse(new Date(user.rows[0].s_subscription_expires).toLocaleString('lt-LT', {dateStyle: 'short'})); 
        
        const accessToken = jwt.sign({ 
            user_id: user.rows[0].id,
            user_name: user.rows[0].email,
            user_role: user.rows[0].role,
            str_cus_id: user.rows[0].stripe_customer_id,
            user_subscription: subs_exp >= today,
            user_s_subscription: s_subs_exp >= today,
            u_status: user.rows[0].u_status,
            s_status: user.rows[0].s_status,
            is_course: user_order?.is_course ? user_order?.is_course : false
        }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES
        });

        const refreshToken = jwt.sign({ 
            user_id: user.rows[0].id,
            user_name: user.rows[0].email,
            user_role: user.rows[0].role,
            str_cus_id: user.rows[0].stripe_customer_id,
            user_subscription: subs_exp >= today,
            user_s_subscription: s_subs_exp >= today,
            u_status: user.rows[0].u_status,
            s_status: user.rows[0].s_status,
            is_course: user_order?.is_course ? user_order?.is_course : false
        }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES
        });
        
        await db.query('UPDATE users SET refresh_token = $1, last_activity = $2 WHERE id = $3', [refreshToken, new Date().toISOString(), user.rows[0].id]);
        res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, maxAge: 2 * 24 * 60 * 60 * 1000 });
        res.cookie(authConfig.REFRESH_TOKEN_COOKIE, token, authConfig.COOKIE_OPTIONS);
        res.status(200).json({
            accessToken
        });
        
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
*/
// refresh
/*
exports.refresh = async (req, res) => {
    const cookies = req.cookies;    
    if(!cookies?.jwt) return res.sendStatus(401);

    const refreshToken = cookies.jwt;
    const user = await db.query('SELECT users.id, stripe_customer_id, subscription, subscription_expires, refresh_token, subscription_type AS u_status, s.status AS s_status, s.current_period_end AS s_subscription_expires FROM users LEFT JOIN subscriptions as s ON s.user_id = users.id WHERE refresh_token = $1', [refreshToken]);
    
    if(!user.rows[0]) return res.sendStatus(403); // Forbidden

    const { rows: [user_order] } = await db.query(`SELECT o.id, o.created_at, s.title,
        CASE 
            WHEN o.created_at IS NULL THEN false
            WHEN (CURRENT_TIMESTAMP - o.created_at) <= INTERVAL '90 days' THEN true
                ELSE false
            END AS is_course
        FROM orders AS o
        LEFT JOIN services AS s ON s.id = o.service_id
        WHERE o.user_id = $1 AND s.category = 'Kursai' 
        ORDER BY o.created_at DESC 
        LIMIT 1`, [user.rows[0].id]);

    
    const today = Date.parse(new Date().toLocaleString('lt-LT', {dateStyle: 'short'}));
    const subs_exp = Date.parse(new Date(user.rows[0].subscription_expires).toLocaleString('lt-LT', {dateStyle: 'short'}));
    const s_subs_exp = Date.parse(new Date(user.rows[0].s_subscription_expires).toLocaleString('lt-LT', {dateStyle: 'short'}));
    
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if(err || user.rows[0].id !== decoded.user_id) return res.sendStatus(403);
            const accessToken = jwt.sign({ 
                user_id: decoded.user_id,
                user_name: decoded.user_name,
                user_role: decoded.user_role,
                is_course: user_order?.is_course,
                str_cus_id: user.rows[0].stripe_customer_id,
                user_subscription: subs_exp >= today,
                user_s_subscription: s_subs_exp >= today,
                u_status: user.rows[0].u_status,
                s_status: user.rows[0].s_status,
            }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES});
            res.json({ accessToken });
        }
    );
}
*/
// logout
/*
exports.logout = async (req, res) => {
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
*/

// forgotPassword
/*
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
        await db.query('UPDATE users SET password_reset_token = $2, password_reset_expires = $3, updated_at = $4 WHERE email = $1', [req.body.email, encryptedToken, (new Date(Date.now()+10*60*1000).toISOString()), new Date().toLocaleString('lt-LT')]);

        // V - Send rest url to user's email
        const resetUrl = `${req.protocol}://${req.get('host')}/keisti-slaptazodi/${resetToken}`;
        await new Email(user.rows[0].email, '', resetUrl).sendForgotPassword();

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
*/
exports.resetPassword = async (req, res) => {
	const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
	const user = await db.query(
		'SELECT email FROM users WHERE "password_reset_token" = $1 AND password_reset_expires > $2',
		[hashedToken, new Date(Date.now()).toISOString()],
	);

	if (!user.rows.length) {
		return res.status(500).json({
			status: 'error',
			message: 'Nuoroda neteisinga, arba nebegaliojanti.',
		});
	}

	res.json({ data: user.rows[0] });
};

exports.updatePassword = async (req, res, next) => {
	const errors = validationResult(req);

	// I Get user based on the token
	const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
	const user = await db.query(
		'SELECT email FROM users WHERE "password_reset_token" = $1 AND password_reset_expires > $2',
		[hashedToken, new Date(Date.now()).toISOString()],
	);
	if (!user.rows.length) {
		return res.status(400).json({
			status: 'error',
			message: 'Nuoroda neteisinga, arba nebegaliojanti.',
		});
	}

	if (!errors.isEmpty() && errors.errors[0].path === 'password') {
		return res.status(400).json({ message: errors.errors[0].msg });
	}

	if (!errors.isEmpty() && errors.errors[0].path === 'passwordConfirmed') {
		return res.status(400).json({ message: errors.errors[0].msg });
	}

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(req.body.password, salt);

	await db.query(
		'UPDATE users SET password = $1, password_reset_token = $2, password_reset_expires = $3 WHERE email = $4',
		[hashedPassword, null, null, user.rows[0].email],
	);
	res.status(200).json({
		status: 'Success',
		message: 'Slaptažodis sėkmingai pakeistas.',
	});

	// II If token has not expired, and there is user, set the NEW password

	// III Update changePasswordAt property for user in DB

	// IV Log the user in, setn JWT
};

exports.protect = (req, res, next) => {
	const authHeader = req.headers['authorization'] || req.headers.Authorization;
	if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);

	const token = authHeader.split(' ').pop();
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
		if (err) return res.sendStatus(403);

		// req.user_id = decoded.user_id;
		// req.user_role = decoded.user_role;
		// req.user_name = decoded.user_name;
		// req.user_subscription = decoded.user_subscription;
		// ((req.is_course = decoded.is_course), (req.str_cus_id = decoded.str_cus_id));
		// req.user_s_subscription = decoded.user_s_subscription;
		// req.s_status = decoded.s_status;
		// req.u_status = decoded.u_status;

		/* - - - - - - - - - - - - - - - TEMPORARY CODE START - - - - - - - - - - - - - - - */
		req.user_id = decoded.user_id;
		req.user_role = decoded.user_role;

		const { rows } = await db.query(
			`
            SELECT email, stripe_customer_id, subscription_expires, 
                   subscription_type AS u_status, s.status AS s_status, 
                   s.current_period_end AS s_subscription_expires
            FROM users 
            LEFT JOIN subscriptions AS s ON s.user_id = users.id 
            WHERE users.id = $1
        `,
			[decoded.user_id],
		);

		if (!rows[0]) return res.sendStatus(401);

		const today = Date.parse(new Date().toLocaleString('lt-LT', { dateStyle: 'short' }));
		const subs_exp = Date.parse(
			new Date(rows[0].subscription_expires).toLocaleString('lt-LT', { dateStyle: 'short' }),
		);
		const s_subs_exp = Date.parse(
			new Date(rows[0].s_subscription_expires).toLocaleString('lt-LT', {
				dateStyle: 'short',
			}),
		);

		req.user_name = rows[0].email;
		req.str_cus_id = rows[0].stripe_customer_id;
		req.user_subscription = subs_exp >= today;
		req.user_s_subscription = s_subs_exp >= today;
		req.u_status = rows[0].u_status;
		req.s_status = rows[0].s_status;

		// Course check
		const {
			rows: [course],
		} = await db.query(
			`
            SELECT CASE WHEN (CURRENT_TIMESTAMP - o.created_at) <= INTERVAL '90 days' 
                THEN true ELSE false END AS is_course
            FROM orders AS o
            LEFT JOIN services AS s ON s.id = o.service_id
            WHERE o.user_id = $1 AND s.category = 'Kursai'
            ORDER BY o.created_at DESC LIMIT 1
        `,
			[decoded.user_id],
		);

		req.is_course = course?.is_course || false;
		/* - - - - - - - - - - - - - - - TEMPORARY CODE END - - - - - - - - - - - - - - - */
		next();
	});
};

exports.isSubscription = (...allowedSubscriptionTypes) => {
	return (req, res, next) => {
		const { user_subscription, user_s_subscription, u_status, s_status } = req;
		const u_sub = user_subscription && allowedSubscriptionTypes.includes(u_status);
		const s_sub = user_s_subscription && allowedSubscriptionTypes.includes(s_status);
		const is_sub = !(u_sub || s_sub);

		if (is_sub)
			return res.status(402).json({
				error: 'Payment Required',
				type: 'subscription',
			});

		next();
	};
};

exports.isCourse = async (req, res, next) => {
	if (!req?.is_course)
		return res.status(402).json({
			error: 'Payment Required',
			type: 'course',
		});

	next();
};

exports.verifyRoles = (...allowedRoles) => {
	return (req, res, next) => {
		if (!req.user_role) return res.sendStatus(401);
		if (!allowedRoles.includes(req.user_role)) return res.sendStatus(401);
		next();
	};
};
