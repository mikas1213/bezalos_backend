// const catchAsync = require('../utils/catchAsync');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
exports.uploadPhoto = upload.single('photo');
exports.uploadData = multer().none();

// exports.uploadFiles = multer({
// 	dest: 'temp/',
// 	limits: { fileSize: 5 * 1024 * 1024 * 1024 }, // Limit to 5GB
// 	fileFilter: (req, file, cb) => {
// 		const isImage = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.mimetype);
// 		const isVideo = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/x-matroska'].includes(
// 			file.mimetype,
// 		);

// 		if (isImage || isVideo) {
// 			cb(null, true);
// 		} else {
// 			cb(new Error('Unsupported file type'), false);
// 		}
// 	},
// }).fields([
// 	{ name: 'video', maxCount: 1 },
// 	{ name: 'photo', maxCount: 1 },
// ]);

exports.resizePhoto = async (req, res, next) => {
	let img_width_l = 576;
	let img_height_l = 1024;

	let img_width_m = 512;
	let img_height_m = 384;

	try {
		if (req.file) {
			const metadata = await sharp(req.file.buffer).metadata();
			let { width, height } = metadata;

			if ('details' in req.body) {
				img_width_l = 1500;
				img_height_l = 1875;
				img_width_m = 675;
				img_height_m = 848;

				if (width > height) {
					img_width_l = 1875;
					img_height_l = 1500;
					img_width_m = 848;
					img_height_m = 675;
				}
			}
			const { buffer, mimetype } = req.file;
			const img_s = await sharp(buffer).resize(128, 128).webp({ quality: 50 }).toBuffer();
			const img_m = await sharp(buffer).resize(img_width_m, img_height_m).webp({ quality: 70 }).toBuffer();
			const img_l = await sharp(buffer).resize(img_width_l, img_height_l).webp({ quality: 95 }).toBuffer();

			req.body.image_s = `data:${mimetype};base64,${img_s.toString('base64')}`;
			req.body.image_m = `data:${mimetype};base64,${img_m.toString('base64')}`;
			req.body.image_l = `data:${mimetype};base64,${img_l.toString('base64')}`;

			req.body_data = img_m;
			return next();
		}
		next();
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// exports.resizePhotoDisk = async (req, res, next) => {
// 	try {
// 		if (!req.files || !req.files.photo) {
// 			return next();
// 		}

// 		const photoFile = req.files.photo[0];
// 		const originalPath = photoFile.path;
// 		const tempPath = originalPath + '_resized';

// 		// Sukuriame modifikuotą nuotrauką
// 		await sharp(originalPath)
// 			.resize(1200, null, {
// 				fit: 'inside',
// 				withoutEnlargement: true,
// 			})
// 			.webp({ quality: 70 })
// 			.toFile(tempPath);

// 		// Atomiškai keičiame failus
// 		fs.renameSync(tempPath, originalPath);

// 		// Atnaujiname failo informaciją
// 		const stats = fs.statSync(originalPath);
// 		req.files.photo[0].size = stats.size;

// 		next();
// 	} catch (error) {
// 		// Valome temp failą jei kažkas nepavyko
// 		if (fs.existsSync(tempPath)) {
// 			fs.unlinkSync(tempPath);
// 		}
// 		next(error);
// 	}
// };
