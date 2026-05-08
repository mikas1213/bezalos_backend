import fs from 'fs';
import slugify from 'slugify';
import { AppError } from '../../../common/errors/AppError';
import { Database } from '../../../common/config/db';
import { Request, Response, NextFunction } from 'express';
const allow_fields = [
	'id',
	'category',
	'title',
	'description',
	'participants',
	'duration',
	'isActive',
	'video',
	'photo',
	'imageS3Key',
	'videoS3Key',
	'videoS3SnippetKey',
	'videoTags',
	'action',
];

export class AdminVideoMiddleware {
	constructor(private readonly db: Database) {}

	addVideoFormValidator = async (req: Request, res: Response, next: NextFunction) => {
		const files = !Array.isArray(req.files) ? req.files : undefined;
		const videoFile = files?.video;
		const photoFile = files?.photo;
		const slug = slugify(req.body.title, {
			replacement: '-',
			lower: true,
			trim: true,
			strict: true,
		});

		const queries = {
			insert: { query: 'SELECT 1 FROM videos WHERE slug = $1', values: [slug] },
			update: {
				query: 'SELECT * FROM videos WHERE slug = $1 AND id != $2',
				values: [slug, req?.params?.id],
			},
		};

		try {
			/* F I E L D   V A L I D A T I O N */
			const bodyKeys = Object.keys(req.body);

			const invalideFields = bodyKeys.filter((field) => !allow_fields.includes(field));
			if (invalideFields.length > 0) throw AppError.badRequest('There are unsupported fields');

			/* T I T L E */
			if (!req.body.title) throw AppError.badRequest('Pavadinimas❗️');
			if (req.body.title.length > 255) throw AppError.badRequest('Pavadinimas per ilgas.\nMax 255 simboliai❗️');

			/* S L U G */
			const action = req.body.action as 'insert' | 'update';
			const slug_exists = await this.db.query(queries[action]?.query, queries[action]?.values);
			if (slug_exists.length > 0 && req.method === 'POST') throw AppError.badRequest('Toks pavadinimas jau yra 🎬');

			/* D E S C R I P T I O N */
			if (!req.body.description) throw AppError.badRequest('Aprašymas! 📄');

			/* D U R A T I O N */
			if (!req.body.duration.trim()) throw AppError.badRequest('Video trukmė! 🎬');
			if (req.body.duration.trim() === '00:00:00') throw AppError.badRequest('Video trukmė! 🎬');
			const duration_regexp = new RegExp(/^(?!00:00:00)(?:\d{1,3}):[0-5]\d:[0-5]\d$/);
			if (!duration_regexp.test(req.body.duration))
				throw AppError.badRequest('Netinkamas formatas! 🎬\nFormatas: (hh:mm:ss)');

			/* I S   A C T I V E */
			if (!req.body.isActive) throw AppError.badRequest('Nenurodyta ar video yra aktyvus! 🎬');
			if (!['true', 'false'].includes(req.body.isActive)) throw AppError.badRequest('Neteisingas aktyvumo statusas! 🎬');

			req.body.title = req.body.title.trim();
			req.body.slug = slug;
			req.body.description = req.body.description.trim();
			req.body.isActive = req.body.isActive === 'true';

			next();
		} catch (err) {
			if (photoFile && photoFile[0].path && fs.existsSync(photoFile[0].path)) {
				fs.unlinkSync(photoFile[0].path);
			}
			if (videoFile && videoFile[0].path && fs.existsSync(videoFile[0].path)) {
				fs.unlinkSync(videoFile[0].path);
			}
			throw err;
		}
	};

	addVideoFilesValidator = async (req: Request, res: Response, next: NextFunction) => {
		const files = !Array.isArray(req.files) ? req.files : undefined;
		const videoFile = files?.video;
		const photoFile = files?.photo;

		try {
			/* V I D E O */
			if (!videoFile) throw AppError.badRequest('Nope, reik video! 🎥');

			/* P H O T O */
			if (!photoFile) throw AppError.badRequest('Nope, reik foto! 🏞');
			next();
		} catch (err) {
			if (photoFile && photoFile[0].path && fs.existsSync(photoFile[0].path)) {
				fs.unlinkSync(photoFile[0].path);
			}

			if (videoFile && videoFile[0].path && fs.existsSync(videoFile[0].path)) {
				fs.unlinkSync(videoFile[0].path);
			}
			throw err;
		}
	};
}
