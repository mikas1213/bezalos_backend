export interface VideoRow {
	image_s3_key: string;
	category: string;
	duration: number;
	title: string;
	description: string;
	created_at: Date;
	video_tags: string[];
	views_total: number;
	slug: string;
	comment_count: number;
	likes_count: number;
}
export interface VideoRowWithCount extends VideoRow {
	total_count: number;
}

export interface VideosDto {
	data: VideoRow[];
	total: number;
	page: number;
	limit: number;
}
export interface VideoDto {
	id: string;
	category: string;
	title: string;
	description: string;
	duration: string;
	created_at: Date;
	is_active: boolean;
	slug: string;
	views_total: number;
	video_s3_snippet_key: string;
	video_s3_key: string;
	image_s3_key: string;
	video_tags: [];
	participants: string;
	comments: [];
	likes_count: number;
	is_liked: boolean;
}

export const ACTIVE_SUBSCRIPTION_STATUSES = ['Virtuvė', 'virtuve', 'Cancel_virtuve'] as const;
type Status = (typeof ACTIVE_SUBSCRIPTION_STATUSES)[number];

export interface UserSubscriptionRow {
	status: Status;
	expires: Date;
}

export interface UserCourseOrderRow {
	is_course: boolean;
}
export interface UserAccessInfo {
	hasSubscription: boolean;
	hasCourse: boolean;
}
