export interface AdmninVirtuveDto {
	category: string;
	commentsCount: number;
	createdAt: Date;
	duration: string;
	id: string;
	isActive: true;
	likesCount: number;
	imageS3Key: string;
	videoS3Key: string;
	videoS3SnippetKey: string;
	title: string;
	description: string;
	videoTags: string[];
	participants: string;
	viewsSnippet: number;
	viewsFull: number;
}

export interface DeleteRequestDto {
	videoId: string;
	imageS3Key: string;
	videoS3Key: string;
	videoS3SnippetKey: string;
}
