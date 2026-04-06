type Role = 1213 | 2324;
type Ustaus = 'profilis' | 'virtuve' | 'free';
type Sstatus =
	| 'free'
	| 'Profilis'
	| 'Virtuvė'
	| 'Cancel_profilis'
	| 'Canceled_profilis'
	| 'Cancel_virtuve'
	| 'Canceled_virtuve'
	| 'UNPAID';

export interface UserWithSubscription {
	id: string;
	role: Role;
	email: string;
	displayName: string;
	password: string;
	stripe_customer_id: string;
	refresh_token_hash: string;
	u_status: Ustaus;
	s_status: Sstatus;
	subscription_expires: Date;
	s_subscription_expires: Date;
}

export interface CourseOrder {
	id: string;
	title: string;
	is_course: boolean;
	created_at: Date;
}
