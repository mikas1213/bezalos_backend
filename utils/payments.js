const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
let = hostname = 'http://localhost:5173';
if(process.env.PROJECT === 'DULEVICIUS') hostname = 'https://bezalos.dulevicius.dev';
if(process.env.PROJECT === 'BEZALOS') hostname = 'https://bezalos.lt';

exports.stripeSubscriptionSession = async (user_id, user_email, priceId, plan_name, plan_price) => {
    
    try {
        const session = await stripe.checkout.sessions.create({
            locale: 'lt',
            mode: 'subscription',
            payment_method_types: ['card'],
            customer_email: user_email,
            // customer: 'cus_QWSmPP402ifTdq',
            line_items: [{
                price: priceId,
                quantity: 1
            }],
            // allow_promotion_codes: plan_price === 'virtuve_month',
            allow_promotion_codes: true,
            // success_url: `${process.env.NODE_ENV === 'development' ? 'http://localhost:5173/apmoketa-sekmingai?session_id={CHECKOUT_SESSION_ID}' : 'https://bezalos.dulevicius.dev/apmoketa-sekmingai?session_id={CHECKOUT_SESSION_ID}'}`,
            // cancel_url: `${process.env.NODE_ENV === 'development' ? 'http://localhost:5173/paslaugos' : 'https://bezalos.dulevicius.dev/paslaugos'}`,
            success_url: `${hostname}/apmoketa-sekmingai?plan=${plan_name}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${hostname}/paslaugos`,
            metadata: { user_id, subscription_status: plan_name },
            // customer_creation: 'if_required' in payment mode only
        });
        return session;

    } catch (err) {
        return err;
    }
};

exports.stripeServiceSession = async (title, price) => {
    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: title
                    },
                    unit_amount: price,
                },
                quantity: 1,
            }],
            // allow_promotion_codes: true,
            // discounts: [
            //     {
            //         coupon: 'promo_1PPVUZAXc9J1oascXnitYSBM',
            //     },
            // ],
            mode: 'payment',
            // success_url: `${process.env.NODE_ENV === 'development' ? 'http://localhost:5173/paslauga-apmoketa' : 'https://bezalos.dulevicius.dev/paslauga-apmoketa'}`,
            // cancel_url: `${process.env.NODE_ENV === 'development' ? 'http://localhost:5173/paslaugos' : 'https://bezalos.dulevicius.dev/paslaugos'}`,
            success_url: `${hostname}/paslauga-apmoketa`,
            cancel_url: `${hostname}/paslaugos`,
        });
        return session;
    } catch (err) {
        return err;
    }
}