interface VideoDtoData {
	id?: string;
	title?: string;
	slug?: string;
	imageS3Key?: string;
	videoS3Key?: string;
	videoS3SnippetKey?: string;
	category?: string;
	description?: string;
	participants?: string;
	duration?: string;
	videoTags?: string[];
	isActive?: boolean;
}

export class VideoDto {
	id?: string;
	title?: string;
	slug?: string;
	imageS3Key?: string;
	videoS3Key?: string;
	videoS3SnippetKey?: string;
	category?: string;
	description?: string;
	participants?: string;
	duration?: string;
	videoTags?: string[];
	isActive?: boolean;

	constructor(data: VideoDtoData = {}) {
		if (data.id !== undefined) this.id = data.id;
		if (data.title !== undefined) this.title = data.title;
		if (data.slug !== undefined) this.slug = data.slug;
		if (data.imageS3Key !== undefined) this.imageS3Key = data.imageS3Key;
		if (data.videoS3Key !== undefined) this.videoS3Key = data.videoS3Key;
		if (data.videoS3SnippetKey !== undefined) this.videoS3SnippetKey = data.videoS3SnippetKey;
		if (data.category !== undefined) this.category = data.category;
		if (data.description !== undefined) this.description = data.description;
		if (data.participants !== undefined) this.participants = data.participants;
		if (data.duration !== undefined) this.duration = data.duration;
		if (data.videoTags !== undefined) this.videoTags = data.videoTags;
		if (data.isActive !== undefined) this.isActive = data.isActive;
	}
}
