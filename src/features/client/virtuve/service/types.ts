export interface VideoDto {
	id: string;
	category: string;
	title: string;
	description: string;
	duration: string;
	createdAt: Date;
	isActive: boolean;
	slug: string;
	viewsTotal: number;
	embedUrl: string | null;
	contentUrl: string | null;
	imageS3Key: string;
	videoTags: [];
	participants: string;
	comments: [];
	likesCount: number;
	isLiked: boolean;
	isSnippet: boolean;
	isCourseMaterial: boolean;
}
