const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require( '../database/db');
let = hostname = 'http://localhost:5173';
if(process.env.PROJECT === 'DULEVICIUS') hostname = 'https://bezalos.dulevicius.dev';
if(process.env.PROJECT === 'BEZALOS') hostname = 'https://bezalos.lt';


const findCustomerById = async customer_id => {

    if (!customer_id) {
        throw new Error('Customer ID is required');
    }
    try {
        const customer = await stripe.customers.retrieve(customer_id);
        return customer && !customer.deleted ? customer.id : null;
    } catch (err) {
        if (err.type === 'StripeInvalidRequestError') {
            if (err.code === 'resource_missing') {
                return null;
            }
        }
        throw err;
    }
};

const findCustomerByEmail = async email => {
    if (!email) {
        throw new Error('Email is required');
    }
    try {
        const customers = await stripe.customers.list({ 
            email,
            limit: 1 
        });
        return customers.data[0]?.id || null;
    } catch (err) {
        throw err; 
    }
}

const isExistStripeCustomer = async (user_id, email) => {

    let data = await db.query('SELECT stripe_customer_id from users WHERE id = $1', [user_id]);
    let str_cust_id = data.rows[0].stripe_customer_id;

    if (str_cust_id) {
        const validCustomer = await findCustomerById(str_cust_id);
        if (validCustomer) {
            console.log('user exist by id')
            return str_cust_id;
        }
    }

    try {
        const customers = await stripe.customers.list({ email, limit: 1 });
        if (customers.data.length > 0) {
            console.log('user exist by email')
            return customers.data[0].id;
        }
    } catch (err) {
        throw err;
    }
    console.log('user don\'t exist')
    return undefined;
};

exports.stripeSubscriptionSession = async (user_id, user_email, priceId, plan_name) => {
    const is_customer_exist = await isExistStripeCustomer(user_id, user_email);

    try {
        const session = await stripe.checkout.sessions.create({
            locale: 'lt',
            mode: 'subscription',
            allow_promotion_codes: true,
            payment_method_types: ['card'],
            customer: is_customer_exist,
            customer_email: !is_customer_exist ? user_email : undefined,
            metadata: { user_id, subscription_status: plan_name },
            line_items: [{
                price: priceId,
                quantity: 1
            }],
            
            success_url: `${hostname}/apmoketa-sekmingai?plan=${plan_name}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${hostname}/paslaugos`
        });
        return session;

    } catch (err) {
        return err;
    }
};

exports.stripeServiceSession = async (user_id, user_name, paslauga) => {

    try {
        
        let customerId = await isExistStripeCustomer(user_id, user_name);
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user_name,
                metadata: { user_id }
            });
            customerId = customer.id;
        }
        
        const session = await stripe.checkout.sessions.create({
            locale: 'lt',
            mode: 'payment',
            allow_promotion_codes: true,
            payment_method_types: ['card'],
            customer: customerId,
            // customer_email: !is_customer_exist ? user_name : undefined,
            metadata: { user_id, paslauga_id: paslauga.id, current_price: paslauga.current_price },
            line_items: [{
                // price: priceId,
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: paslauga.title
                    },
                    unit_amount: paslauga.current_price * 100,
                },
                quantity: 1
            }],
            success_url: `${hostname}/paslauga-apmoketa`,
            cancel_url: `${hostname}/paslaugos`,
        });
        return session;
    } catch (err) {
        return err;
    }
}