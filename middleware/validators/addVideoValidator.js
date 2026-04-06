const db = require('../../database/db');
const fs = require('fs');
const slugify = require('slugify');
const catchAsync = require('../../utils/catchAsync');
const { ValidationError } = require('../../utils/errors');

const allow_fields = [
	'id',
	'video_type',
	'category',
	'title',
	'description',
	'search_tag',
	'duration',
	'is_active',
	'video',
	'photo',
	'image_s3_key',
	'video_s3_key',
	'action',
];
const allow_filters = ['vebinaras', 'emocinis valgymas', 'mityba', 'trumpai', 'valgymo psichologija'];

exports.addVideoFormValidator = catchAsync(async (req, res, next) => {
	const videoFile = req.files.video;
	const photoFile = req.files.photo;
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
		if (invalideFields.length > 0) throw new ValidationError('There are unsupported fields');

		/* F I L T E R   V A L I D A T I O N */
		const filters = req.body.search_tag.split(', ');
		const invalidFilter = !filters.every((filter) => allow_filters.includes(filter));

		/* T I T L E */
		if (!req.body.title) throw new ValidationError('Pavadinimas❗️');
		if (req.body.title.length > 255) throw new ValidationError('Pavadinimas per ilgas.\nMax 255 simboliai❗️');

		/* S L U G */
		const slug_exists = await db.query(queries[req.body.action]?.query, queries[req.body.action]?.values);
		if (slug_exists.rowCount && req.method === 'POST') throw new ValidationError('Toks pavadinimas jau yra 🎬');

		/* D E S C R I P T I O N */
		if (!req.body.description) throw new ValidationError('Aprašymas! 📄');

		/* V I D E O   T Y P E */
		if (!req.body.video_type) throw new ValidationError('Video tipas! 🎬');
		if (!['kursai', 'virtuve'].includes(req.body.video_type)) throw new ValidationError('Neteisingas video tipas! 🎬');

		/* C A T E G O R Y */
		if (!req.body.category) throw new ValidationError('Video kategorija! 🎬');
		if (!['Kursai', 'Vebinaras', 'Trumpai'].includes(req.body.category))
			throw new ValidationError('Neteisinga video kategorija! 🎬');

		/* D U R A T I O N */
		if (!req.body.duration.trim()) throw new ValidationError('Video trukmė! 🎬');
		if (req.body.duration.trim() === '00:00:00') throw new ValidationError('Video trukmė! 🎬');
		const duration_regexp = new RegExp(/^(?!00:00:00)(?:\d{1,3}):[0-5]\d:[0-5]\d$/);
		if (!duration_regexp.test(req.body.duration)) throw new ValidationError('Netinkamas formatas! 🎬\nFormatas: (hh:mm:ss)');

		/* I S   A C T I V E */
		if (!req.body.is_active) throw new ValidationError('Nenurodyta ar video yra aktyvus! 🎬');
		if (!['true', 'false'].includes(req.body.is_active)) throw new ValidationError('Neteisingas aktyvumo statusas! 🎬');

		/* F I L T E R S */
		if (!req.body.search_tag) throw new ValidationError('Filtrai 🔖');
		if (invalidFilter) throw new ValidationError('There are unsupported filters 🔖');

		req.body.title = req.body.title.trim();
		req.body.slug = slug;
		req.body.description = req.body.description.trim();
		req.body.is_active = req.body.is_active === 'true';

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
});

exports.addVideoFilesValidator = catchAsync(async (req, res, next) => {
	const videoFile = req.files.video;
	const photoFile = req.files.photo;

	try {
		/* V I D E O */
		if (!videoFile) throw new ValidationError('Nope, reik video! 🎥');

		/* P H O T O */
		if (!photoFile) throw new ValidationError('Nope, reik foto! 🏞');
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
});
