const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../database/db');
const Email = require('../utils/email');
const { stripeSubscriptionSession, stripeServiceSession } = require('../utils/payments');

let = hostname = 'http://localhost:5173';
if (process.env.PROJECT === 'DULEVICIUS') hostname = 'https://bezalos.dulevicius.dev';
if (process.env.PROJECT === 'BEZALOS') hostname = 'https://bezalos.lt';

exports.createSubcsriptionSession = async (req, res) => {
	const { user_id, plan_price, plan_name } = req.body;

	try {
		// const session = await stripeSubscriptionSession(user_id, req.user_name, prices_ids[plan_price], plan_name);
		const session = await stripeSubscriptionSession(user_id, req.user_name, plan_price, plan_name);
		res.status(200).json({ session });
	} catch (err) {
		console.log(err.message);
	}
};

exports.createServiceSession = async (req, res) => {
	if (req.method !== 'POST') {
		return res.status(405).json({ message: 'Method not allowed' });
	}

	const { user_role, user_id, service, code, isCodeApproved } = req.body;
	try {
		const session = await stripeServiceSession(user_role, user_id, req.user_name, service, code, isCodeApproved);
		res.status(200).json({ session });
	} catch (err) {
		console.log(err.message);
	}
};

exports.paymentSuccess = async (req, res) => {
	const event_type = req.body.type;
	const data = req.body.data;

	if (
		event_type === 'checkout.session.completed' &&
		data.object.mode === 'subscription' &&
		data.object.payment_status === 'paid'
	) {
		const userId = data.object.metadata.user_id;
		let type = 'free';
		let stripe_username = data.object?.customer_details?.name;
		console.log('data.object.metadata.subscription_status: ', data.object.metadata.subscription_status);
		if (data.object.metadata.subscription_status === 'profilis') type = 'Profilis';
		if (data.object.metadata.subscription_status === 'virtuve') type = 'Virtuvė';
		if (data.object.metadata.subscription_status === 'virtuve_plus') type = 'Virtuvė Plus';

		await db.query(
			'UPDATE users SET subscription = $2, stripe_customer_id = $3, subscription_type = $4, stripe_username = $5, updated_at = $6 WHERE id = $1',
			[userId, true, data.object.customer, type, stripe_username, new Date().toLocaleString('lt-LT')],
		);

		const subscription = await stripe.subscriptions.retrieve(data.object.subscription);
		const subs_start = new Date(subscription.current_period_start * 1000).toLocaleString('lt-LT', {
			dateStyle: 'short',
			timeStyle: 'medium',
		});
		const subs_end = new Date(subscription.current_period_end * 1000).toLocaleString('lt-LT', {
			dateStyle: 'short',
			timeStyle: 'medium',
		});
		await db.query(
			'INSERT INTO subscriptions(user_id, stripe_subscription_id, status, current_period_start, current_period_end) VALUES ($1, $2, $3, $4, $5);',
			[userId, subscription.id, data.object.metadata.subscription_status, subs_start, subs_end],
		);

		// UPDATE CUSTOMER INFO
		await stripe.customers.update(data.object.customer, { metadata: { user_id: userId } });
	}

	if (event_type === 'customer.subscription.updated') {
		const subs_start = new Date(data.object.current_period_start * 1000).toLocaleString('lt-LT', {
			dateStyle: 'short',
			timeStyle: 'medium',
		});
		const subs_end = new Date(data.object.current_period_end * 1000).toLocaleString('lt-LT', {
			dateStyle: 'short',
			timeStyle: 'medium',
		});
		const price = await stripe.prices.retrieve(data.object.plan.id);
		console.log('price.metadata.s_plan: ', price.metadata.s_plan);
		console.log('price.schedule: ', data.object.schedule);
		console.log('price.metadata.phased: ', price.metadata.phased === 'true');
		const stripe_customer = await stripe.customers.retrieve(data.object.customer);

		const prod = await stripe.products.retrieve(data.object.plan.product);
		const subscription_status = !data.object.cancel_at ? price.metadata.u_plan : `Cancel_${price.metadata.s_plan}`;
		await db.query(
			'UPDATE users SET subscription_type = $2, stripe_username = $3, updated_at = $4 WHERE stripe_customer_id = $1',
			[data.object.customer, subscription_status, stripe_customer.name, new Date().toLocaleString('lt-LT')],
		);
		await db.query(
			'UPDATE subscriptions SET current_period_start = $1, current_period_end = $2, status = $3 WHERE stripe_subscription_id = $4',
			[subs_start, subs_end, price.metadata.s_plan, data.object.id],
		);
	}

	if (event_type === 'invoice.payment_failed') {
		console.log('invoice.payment_failed');
		// console.log('cia', req.body)
		// const subscription = await stripe.subscriptions.retrieve(data.object.subscription);
		// const subs_start = new Date(subscription.current_period_start*1000).toLocaleString('lt-LT', { dateStyle: 'short', timeStyle: 'medium' });
		// const subs_end = new Date(subscription.current_period_end*1000).toLocaleString('lt-LT', { dateStyle: 'short', timeStyle: 'medium' });

		// await db.query('INSERT INTO subscriptions(user_id, stripe_subscription_id, status, current_period_start, current_period_end) VALUES ($1, $2, $3, $4, $5);', [userId, subscription.id, data.object.metadata.subscription_status, subs_start, subs_end]);
	}

	if (event_type === 'customer.subscription.deleted') {
		const plan = data.object.plan.metadata.s_plan;
		const reason = data.object.cancellation_details.reason;
		const subscription_status = plan === 'virtuve' && reason === 'payment_failed' ? 'UNPAID' : `Canceled_${plan}`;

		await db.query(
			'UPDATE users SET subscription = $2, subscription_type = $3, subscription_expires = $4, updated_at = $5  WHERE stripe_customer_id = $1',
			[data.object.customer, 'false', subscription_status, null, new Date().toLocaleString('lt-LT')],
		);
		await db.query('DELETE from subscriptions WHERE stripe_subscription_id = $1', [data.object.id]);
	}

	/* O-N-E---P-A-Y-M-E-N-T---W-E-B-H-O-O-K-S */
	if (event_type === 'checkout.session.completed' && data.object.mode === 'payment' && data.object.payment_status === 'paid') {
		const { user_id, email, category, paslauga_id, title, current_price, code, isCodeApproved } = data.object.metadata;

		await stripe.customers.update(data.object.customer, { metadata: { user_id } });
		await db.query('UPDATE services SET quantity = quantity - $1 WHERE id = $2', [1, paslauga_id]);
		await db.query('INSERT INTO orders(user_id, title, price, promo_code, service_id) VALUES($1, $2, $3, $4, $5)', [
			user_id,
			title,
			current_price,
			code,
			paslauga_id,
		]);

		if (JSON.parse(isCodeApproved)) {
			await db.query('UPDATE promotions SET usage_count = usage_count + 1 WHERE promo_code = $1', [code]);
		}

		if (category === 'Kursai') {
			await new Email(email, 'course', 'https://bezalos.lt/virtuve?cat=kursai').sendCourse();
		}
	}
	res.sendStatus(200);
};

exports.customerPortal = async (req, res) => {
	try {
		const session = await stripe.billingPortal.sessions.create({
			customer: req.str_cus_id,
			locale: 'lt',
			return_url: `${hostname}/naryste`,
		});

		res.status(200).json({ session });
	} catch (err) {
		console.log(err.message);
	}
};
