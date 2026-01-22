interface UserBase {
  id: string;
  email: string;
  role: string;
  stripe_customer_id: string | null;
  subscription_expires: Date | null;
  subscription_type: string | null;
  subscription_status: string | null;
  subscription_period_end: Date | null;
}

export interface UserWithPassword extends UserBase {
  name: string;
  password: string;
  refresh_token_hash: string | null;
}

export interface UserWithName extends UserBase {
  name: string;
}

export interface UserWithRefreshToken extends UserBase {
  refresh_token_hash: string | null;
}

export interface CourseOrder {
  id: string;
  created_at: Date;
  title: string;
  is_course: boolean;
}

export interface CreateUserData {
  name: string;
  email: string;
  initialTarget: string;
  passwordHash: string;
}

export interface CreatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface PasswordResetUser {
  id: string;
  email: string;
}