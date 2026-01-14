import { db } from '../../../common/config/db';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { authConfig } from '../config';
import { AuthService } from '../service/AuthService';
// const Email = require('../utils/email');
import { Request, Response } from 'express';



export class AuthController {
    private authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
        this.login = this.login.bind(this);
    }

    async login(req: Request, res: Response) {
        
        const { email, password } = req.body;
        const { accessToken, refreshToken, user } = await this.authService.login(email, password);
        
        this.setRefreshTokenCookie(res, refreshToken);

        res.status(200).json({
            status: 'success',
            data: {
                accessToken,
                user
            }
        });
    }

    private setRefreshTokenCookie(res: Response, token: string) {
        res.cookie(authConfig.REFRESH_TOKEN_COOKIE, token, authConfig.COOKIE_OPTIONS);
        // res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, maxAge: 2 * 24 * 60 * 60 * 1000 });
    }
}

// export const login = async (req: Request, res: Response) => {
    
//     try {
//         const errors = validationResult(req);

//         const { email, password } = req.body;
//         if(!errors.isEmpty()) return res.status(400).json({ errors: errors.errors });

//         const user = await db.query('SELECT users.id, stripe_customer_id, role, email, password, subscription_expires, subscription_type AS u_status, s.status AS s_status, s.current_period_end AS s_subscription_expires FROM users LEFT JOIN subscriptions as s ON s.user_id = users.id WHERE email = $1', [email]);
        
//         if(!user.rows[0]) return res.status(401).json({errors: [{path: 'auth', type: 'server', msg: 'Netinkamas el. paštas arba slaptažodis!'}]}); 
        
//         const validPassword = await bcrypt.compare(password, user.rows[0].password);
//         if(!validPassword) return res.status(401).json({errors: [{path: 'auth', type: 'server', msg: 'Netinkamas el. paštas arba slaptažodis!'}]});

//         const { rows: [user_order] } = await db.query(`SELECT o.id, o.created_at, s.title,
//             CASE 
//                 WHEN o.created_at IS NULL THEN false
//                 WHEN (CURRENT_TIMESTAMP - o.created_at) <= INTERVAL '90 days' THEN true
//                     ELSE false
//                 END AS is_course
//             FROM orders AS o
//             LEFT JOIN services AS s ON s.id = o.service_id
//             WHERE o.user_id = $1 AND s.category = 'Kursai' 
//             ORDER BY o.created_at DESC 
//             LIMIT 1`, [user.rows[0].id]);
        
//         const today = Date.parse(new Date().toLocaleString('lt-LT', {dateStyle: 'short'}));
//         const subs_exp = Date.parse(new Date(user.rows[0].subscription_expires).toLocaleString('lt-LT', {dateStyle: 'short'}));
//         const s_subs_exp = Date.parse(new Date(user.rows[0].s_subscription_expires).toLocaleString('lt-LT', {dateStyle: 'short'})); 
        
//         const accessToken = jwt.sign({ 
//             user_id: user.rows[0].id,
//             user_name: user.rows[0].email,
//             user_role: user.rows[0].role,
//             str_cus_id: user.rows[0].stripe_customer_id,
//             user_subscription: subs_exp >= today,
//             user_s_subscription: s_subs_exp >= today,
//             u_status: user.rows[0].u_status,
//             s_status: user.rows[0].s_status,
//             is_course: user_order?.is_course ? user_order?.is_course : false
//         }, process.env.ACCESS_TOKEN_SECRET, {
//             expiresIn: process.env.ACCESS_TOKEN_EXPIRES
//         });

//         const refreshToken = jwt.sign({ 
//             user_id: user.rows[0].id,
//             user_name: user.rows[0].email,
//             user_role: user.rows[0].role,
//             str_cus_id: user.rows[0].stripe_customer_id,
//             user_subscription: subs_exp >= today,
//             user_s_subscription: s_subs_exp >= today,
//             u_status: user.rows[0].u_status,
//             s_status: user.rows[0].s_status,
//             is_course: user_order?.is_course ? user_order?.is_course : false
//         }, process.env.REFRESH_TOKEN_SECRET, {
//             expiresIn: process.env.REFRESH_TOKEN_EXPIRES
//         });
        
//         await db.query('UPDATE users SET refresh_token = $1, last_activity = $2 WHERE id = $3', [refreshToken, new Date().toISOString(), user.rows[0].id]);
//         res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, maxAge: 2 * 24 * 60 * 60 * 1000 });

//         res.status(200).json({
//             accessToken
//         });
        
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

