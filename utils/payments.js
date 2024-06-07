// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const stripe = require('stripe')('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');

exports.stripeSession = async (user_id, user_email, priceId, plan_name) => {
    console.log('FROM stripeSession: ', user_id, user_email, priceId, plan_name)
    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer_email: user_email,
            line_items: [{
                price: priceId,
                quantity: 1
            }],
            success_url: 'https://bezalos.dulevicius.dev/paslaugos',
            cancel_url: 'https://bezalos.dulevicius.dev'
            
            // success_url: `${process.env.NODE_ENV === 'development' ? 'http://localhost:5173/apmoketa-sekmingai?session_id={CHECKOUT_SESSION_ID}' : '/apmoketa-sekmingai?session_id={CHECKOUT_SESSION_ID}'}`,
            // cancel_url: `${process.env.NODE_ENV === 'development' ? 'http://localhost:5173/paslaugos' : '/paslaugos'}`,
            // metadata: { user_id, subscription_status: plan_name }
        });
        console.log('Session: ', session)
        return session;

    } catch (err) {
        return err;
    }
};
