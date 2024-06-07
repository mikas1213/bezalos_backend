const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.stripeSession = async (user_id, user_email, priceId, plan_name) => {
    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer_email: user_email,
            line_items: [{
                price: priceId,
                quantity: 1
            }],
            success_url: `${process.env.NODE_ENV === 'development' ? 'http://localhost:5173/apmoketa-sekmingai?session_id={CHECKOUT_SESSION_ID}' : '/apmoketa-sekmingai?session_id={CHECKOUT_SESSION_ID}'}`,
            cancel_url: `${process.env.NODE_ENV === 'development' ? 'http://localhost:5173/paslaugos' : '/paslaugos'}`,
            metadata: { user_id, subscription_status: plan_name }
        });
        return session;

    } catch (err) {
        return err;
    }
};
