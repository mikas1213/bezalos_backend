// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const stripe = require('stripe')('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');
const db = require('../database/db');
const { stripeSession } = require('../utils/payments');

const prices_ids = {
    virtuve_month: process.env.STRIPE_VIRTUVE_PRICE_MONTH || 'price_1POz5RAXc9J1oascpD0OMQ4u',
    virtuve_year: process.env.STRIPE_VIRTUVE_PRICE_YEAR || 'price_1POz6EAXc9J1oascDmMAVsGm',
    profilis_month: process.env.STRIPE_PROFILIS_PRICE_MONTH || 'price_1POz7PAXc9J1oascaNme3Vp3',
    profilis_year: process.env.STRIPE_PROFILIS_PRICE_YEAR || 'price_1POz7lAXc9J1oasccewzqaTY'
};

exports.createCheckoutSession = async (req, res, next) => {
    console.log('from createCheckoutSession: ', prices_ids);
    const {
        user_id, 
        plan_price, 
        plan_name,
    } = req.body;
    
    try {
        const session = await stripeSession(user_id, req.user_name, prices_ids[plan_price], plan_name);
        // await db.query('UPDATE users SET subscription_session_id = $1 WHERE id = $2', [session.id, req.user_id]);
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
        if(data.object.metadata.subscription_status === 'virtuve') type = 'Virtuvė';
        if(data.object.metadata.subscription_status === 'profilis') type = 'Profilis';
        await db.query('UPDATE users SET subscription = $2, stripe_customer_id = $3, subscription_type = $4 WHERE id = $1', [userId, true, data.object.customer, type]);

        const subscription = await stripe.subscriptions.retrieve(data.object.subscription);
        const subs_start = new Date(subscription.current_period_start*1000).toLocaleString('lt-LT', { dateStyle: 'short', timeStyle: 'medium' }); 
        const subs_end = new Date(subscription.current_period_end*1000).toLocaleString('lt-LT', { dateStyle: 'short', timeStyle: 'medium' });
        await db.query('INSERT INTO subscriptions(user_id, stripe_subscription_id, status, current_period_start, current_period_end) VALUES ($1, $2, $3, $4, $5);', [userId, subscription.id, data.object.metadata.subscription_status, subs_start, subs_end]);
    }

    if(event_type === 'invoice.paid') {
        const subs_start = new Date(data.object.period_start*1000).toLocaleString('lt-LT', { dateStyle: 'short', timeStyle: 'medium' }); 
        const subs_end = new Date(data.object.period_end*1000).toLocaleString('lt-LT', { dateStyle: 'short', timeStyle: 'medium' });
        await db.query('UPDATE subscriptions SET current_period_start = $1, current_period_end = $2 WHERE stripe_subscription_id = $3', [subs_start, subs_end, data.object.subscription]);
    }

    if(event_type === 'customer.subscription.deleted') {
        await db.query('UPDATE users SET subscription = $1, subscription_type = $2, subscription_expires = $3  WHERE stripe_customer_id = $4', ['false', 'free', null, data.object.customer]);
        await db.query('DELETE from subscriptions WHERE stripe_subscription_id = $1', [data.object.id]);
    }
    // switch (event_type) {
    //     case 'checkout.session.completed':
            // Payment is successful and the subscription is created.
            // You should provision the subscription and save the customer ID to your database.
        //     console.log(data.object.customer, 'checkout.session.completed')
        //     return res.status(200).json({data});
        //     break;
        // case 'invoice.paid':
            // Continue to provision the subscription as payments continue to be made.
            // Store the status in your database and check when a user accesses your service.
            // This approach helps you avoid hitting rate limits.
        //     console.log('invoice.paid')
        //     break;
        // case 'invoice.payment_failed':
            // The payment failed or the customer does not have a valid payment method.
            // The subscription becomes past_due. Notify your customer and send them to the
            // customer portal to update their payment information.
    //         console.log('failed')
    //         break;
    //     default:
    //         console.log('empty');
    // }
    
    // if(req.body.type === 'checkout.session.completed' && req.body.data.object.payment_status === 'paid') {
        
        
    //     console.log('data: ', data.object.customer);

    //     res.status(200).json({
    //         status: 'success'
    //     });


    // } else if(req.body.type === 'payment_intent.payment_failedd') {
    //     console.log('nera pinigu')
    // } else if(req.body.type === 'charge.succeeded') {
    //     console.log('kortelė nuskaityta')
    // } else if(req.body.type === 'invoice.paid') {
    //     console.log('invoice.paid')
    // } 
        // 'customer.subscription.deleted'
        // 'customer.subscription.updated'
        // if(req.body.type === 'payment_intent.payment_failed') {
        //     console.log(req.body.type)
        //     throw new Error('Apmokėti nepavyko');
        // }

        // if(req.body.type === 'checkout.session.completed') {
            // const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
            // const customer = await stripe.customers.retrieve(session.customer);

            // res.status(200).json({
            //     session,
            //     customer
            // });
        // } 
        // else {
        //     res.status(500).json({
        //         status: 'error'
        //     });
        // }
    res.sendStatus(200);
}

// Stripe WebHook
const endpointSecret = 'whsec_269b2bdc66d424c1356957cccfdee4aba11f70fe1a7248216a4d0dfa44b7e418';
exports.paymentSuccessWebHook = async (req, res) => {
    
    // const sig = req.headers['stripe-signature'];
    // let event;

    // try {
    //     event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    //     console.log('Status 200 Done!');
    // } catch (err) {
    //     console.log('Error!!!')
    //     res.status(400).send(`Webhook Error: ${err.message}`);
    //     return;
    // }
    if(req.body.type === 'checkout.session.completed') {
        
            
        console.log('BODIS: ', req.body.data.object);
        console.log('customer', req.body.customer)
        // await db.query('UPDATE users SET subscription = $1, subscription_expires = $2 WHERE id = $3', [true, session.id, req.user_id]);
        // subscription_expires
    }
    // Return a 200 res to acknowledge receipt of the event
    res.send().end();
};