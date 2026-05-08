export const allowFeatures = ['all', 'virtuve', 'receptai'] as const;
export type Feature = (typeof allowFeatures)[number];

export type Category = 'category' | 'tag';
export type TagType = 'category' | 'tag';

export interface TagsResult {
	categories: string[];
	tags: string[];
}
