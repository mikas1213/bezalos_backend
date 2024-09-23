const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../database/db');
const { stripeSubscriptionSession, stripeServiceSession } = require('../utils/payments');


const prices_ids = {
    profilis_month: process.env.STRIPE_PROFILIS_PRICE_MONTH,
    profilis_year: process.env.STRIPE_PROFILIS_PRICE_YEAR,
    virtuve_month: process.env.STRIPE_VIRTUVE_PRICE_MONTH,
    virtuve_year: process.env.STRIPE_VIRTUVE_PRICE_YEAR
};

let = hostname = 'http://localhost:5173';
if(process.env.PROJECT === 'DULEVICIUS') hostname = 'https://bezalos.dulevicius.dev';
if(process.env.PROJECT === 'BEZALOS') hostname = 'https://bezalos.lt';

exports.createCheckoutSession = async (req, res) => {
    
    const { user_id, plan_price, plan_name, } = req.body;
    
    try {
        const session = await stripeSubscriptionSession(user_id, req.user_name, prices_ids[plan_price], plan_name, plan_price);
        res.status(200).json({session});
    } catch (err) {
        console.log(err.message)
    }
};

exports.paymentSuccess = async (req, res) => {
    const event_type = req.body.type;
    const data = req.body.data;
    
    if(event_type === 'checkout.session.completed' && data.object.payment_status === 'paid') {
        const userId = data.object.metadata.user_id;
        let type = 'free';
        let stripe_username = data.object?.customer_details?.name;

        if(data.object.metadata.subscription_status === 'virtuve') type = 'Virtuvė';
        if(data.object.metadata.subscription_status === 'profilis') type = 'Profilis';
        await db.query('UPDATE users SET subscription = $2, stripe_customer_id = $3, subscription_type = $4, stripe_username = $5, updated_at = $6 WHERE id = $1', [userId, true, data.object.customer, type, stripe_username, new Date().toLocaleString('lt-LT')]);

        const subscription = await stripe.subscriptions.retrieve(data.object.subscription);
        const subs_start = new Date(subscription.current_period_start*1000).toLocaleString('lt-LT', { dateStyle: 'short', timeStyle: 'medium' }); 
        const subs_end = new Date(subscription.current_period_end*1000).toLocaleString('lt-LT', { dateStyle: 'short', timeStyle: 'medium' });
        await db.query('INSERT INTO subscriptions(user_id, stripe_subscription_id, status, current_period_start, current_period_end) VALUES ($1, $2, $3, $4, $5);', [userId, subscription.id, data.object.metadata.subscription_status, subs_start, subs_end]);
    }

    if(event_type === 'customer.subscription.updated') {
        const subs_start = new Date(data.object.current_period_start*1000).toLocaleString('lt-LT', { dateStyle: 'short', timeStyle: 'medium' }); 
        const subs_end = new Date(data.object.current_period_end*1000).toLocaleString('lt-LT', { dateStyle: 'short', timeStyle: 'medium' });
        const price = await stripe.prices.retrieve(data.object.plan.id);

        const subscription_status = !data.object.cancel_at ? price.metadata.u_plan : `Cancel_${price.metadata.s_plan}`;
        await db.query('UPDATE users SET subscription_type = $2, updated_at = $3 WHERE stripe_customer_id = $1', [data.object.customer, subscription_status, new Date().toLocaleString('lt-LT')]);
        await db.query('UPDATE subscriptions SET current_period_start = $1, current_period_end = $2,  status = $3 WHERE stripe_subscription_id = $4', [subs_start, subs_end, price.metadata.s_plan, data.object.id]);
    }

    if(event_type === 'invoice.payment_failed') {
        const subscription = await stripe.subscriptions.retrieve(data.object.subscription);
        const subs_start = new Date(subscription.current_period_start*1000).toLocaleString('lt-LT', { dateStyle: 'short', timeStyle: 'medium' }); 
        const subs_end = new Date(subscription.current_period_end*1000).toLocaleString('lt-LT', { dateStyle: 'short', timeStyle: 'medium' });

        await db.query('INSERT INTO subscriptions(user_id, stripe_subscription_id, status, current_period_start, current_period_end) VALUES ($1, $2, $3, $4, $5);', [userId, subscription.id, data.object.metadata.subscription_status, subs_start, subs_end]);
    }

    if(event_type === 'customer.subscription.deleted') {
        const subscription_status = `Canceled_${data.object.plan.metadata.s_plan}`;
        const stripe_customer = await stripe.customers.retrieve(data.object.customer);
        
        await stripe.customers.del(stripe_customer.id);
        await db.query('UPDATE users SET subscription = $2, subscription_type = $3, subscription_expires = $4, stripe_customer_id = $5, updated_at = $6  WHERE stripe_customer_id = $1', [data.object.customer, 'false', subscription_status, null, null, new Date().toLocaleString('lt-LT')]);
        await db.query('DELETE from subscriptions WHERE stripe_subscription_id = $1', [data.object.id]);
    }
    res.sendStatus(200);
}

exports.createServiceSession = async (req, res) => {
    const { title, price } = req.body;
    
    try {
        const session = await stripeServiceSession(title, price);
        res.status(200).json({session});
    } catch (err) {
        console.log(err.message);
    }
};

exports.customerPortal = async (req, res) => {
    try {
        const session = await stripe.billingPortal.sessions.create({
            customer: req.str_cus_id,
            locale: 'lt',
            // return_url: `${process.env.NODE_ENV === 'development' ? 'http://localhost:5173/paslaugos' : 'https://bezalos.dulevicius.dev/paslaugos'}`,
            return_url: `${hostname}/paslaugos`,
            // flow_data: {
                // type: 'payment_method_update',
                // type: 'subscription_update',
                // type: 'subscription_cancel',
                
                // subscription_update: {
                //     subscription: 'sub_1PbRK3AXc9J1oascQhAtnZyK',
                // },
                // subscription_cancel: {
                //     subscription: 'sub_1PbRK3AXc9J1oascQhAtnZyK',
                // },
            // },
            
        });

        res.status(200).json({session});
    } catch (err) {
        console.log(err.message)
    }
    
};