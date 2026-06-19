import { Request, Response, NextFunction } from 'express';
import { VirtuveService } from '../client/virtuve/service/VirtuveService';
import { AppError } from '../../common/errors/AppError';
import { ArticleSeo, getArticleSeoBySlug } from './articlesSeoData';

const S3_BASE = 'https://bezalos.s3.us-east-1.amazonaws.com/';
const SITE_BASE = 'https://www.bezalos.lt';

/** Escape user-visible text before interpolating it into HTML attributes. */
const escapeHtml = (value: string): string =>
	value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const toIsoDuration = (hms: string | null | undefined): string | null => {
	if (!hms) return null;
	const parts = hms.split(':').map(Number);
	if (parts.length !== 3 || parts.some(isNaN)) return null;
	const [h, m, s] = parts;
	const result = `PT${h ? h + 'H' : ''}${m ? m + 'M' : ''}${s ? s + 'S' : ''}`;
	return result === 'PT' ? null : result;
};

const buildVideoMetaHtml = (video: Awaited<ReturnType<VirtuveService['getOneVideo']>>) => {
	if (!video) return '';

	const pageUrl = `https://www.bezalos.lt/virtuve/${video.slug}`;
	const thumbnailUrl = `${S3_BASE}${video.imageS3Key}`;
	const description = video.description.slice(0, 160);
	const uploadDate = new Date(video.createdAt).toISOString();

	const duration = toIsoDuration(video.duration);

	const schema = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'VideoObject',
		name: video.title,
		description: video.description,
		thumbnailUrl,
		uploadDate,
		...(video.contentUrl && { contentUrl: video.contentUrl }),
		...(duration && { duration }),
		keywords: [video.title, 'virtuvė', 'be žalos', 'sveikas maistas', ...video.videoTags].join(', '),
		author: { '@type': 'Person', name: 'Be žalos' },
	});

	return `<!DOCTYPE html>
<html lang="lt">
<head>
  <meta charset="UTF-8">
  <title>${video.title} | Be žalos Virtuvė</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${pageUrl}">
  <meta property="og:site_name" content="Be žalos">
  <meta property="og:locale" content="lt_LT">
  <meta property="og:title" content="${video.title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="video.other">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:image" content="${thumbnailUrl}">
  ${video.contentUrl ? `<meta property="og:video" content="${video.contentUrl}">` : ''}
  <meta name="twitter:card" content="${video.contentUrl ? 'player' : 'summary_large_image'}">
  <meta name="twitter:title" content="${video.title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${thumbnailUrl}">
  ${video.contentUrl ? `<meta name="twitter:player" content="${video.contentUrl}">` : ''}
  <script type="application/ld+json">${schema}</script>
</head>
<body></body>
</html>`;
};

const buildArticleMetaHtml = (article: ArticleSeo): string => {
	const pageUrl = `${SITE_BASE}/straipsniai/${article.slug}`;
	const imageUrl = `${SITE_BASE}/og-articles/${article.image}`;
	const title = escapeHtml(article.title);
	const description = escapeHtml(article.description.slice(0, 200));

	const schema = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: article.title,
		description: article.description,
		image: imageUrl,
		url: pageUrl,
		mainEntityOfPage: pageUrl,
		author: { '@type': 'Person', name: 'Sandra Jatulytė' },
		publisher: {
			'@type': 'Organization',
			name: 'Be žalos',
			logo: { '@type': 'ImageObject', url: `${SITE_BASE}/be-zalos.png` },
		},
	});

	return `<!DOCTYPE html>
<html lang="lt">
<head>
  <meta charset="UTF-8">
  <title>${title} | Be žalos</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${pageUrl}">
  <meta property="og:site_name" content="Be žalos">
  <meta property="og:locale" content="lt_LT">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:image" content="${imageUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  <script type="application/ld+json">${schema}</script>
</head>
<body></body>
</html>`;
};

export class SeoController {
	constructor(private readonly virtuveService: VirtuveService) {}

	getVideoMeta = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const { slug } = req.params;
			const video = await this.virtuveService.getOneVideo(slug, undefined);
			const html = buildVideoMetaHtml(video);
			res.setHeader('Content-Type', 'text/html; charset=utf-8');
			res.send(html);
		} catch (err) {
			if (err instanceof AppError && err.statusCode === 404) {
				res.status(404).send('<html><body>Not found</body></html>');
				return;
			}
			next(err);
		}
	};

	getArticleMeta = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
			const article = getArticleSeoBySlug(slug);
			if (!article) {
				res.status(404).send('<html><body>Not found</body></html>');
				return;
			}
			const html = buildArticleMetaHtml(article);
			res.setHeader('Content-Type', 'text/html; charset=utf-8');
			res.send(html);
		} catch (err) {
			next(err);
		}
	};
}
