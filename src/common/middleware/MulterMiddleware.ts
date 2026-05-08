// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });
// exports.uploadPhoto = upload.single('photo');
// exports.uploadData = multer().none();

import fs from 'fs';
import sharp from 'sharp';
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

export const uploadFiles = multer({
	dest: 'temp/',
	limits: { fileSize: 5 * 1024 * 1024 * 1024 }, // Limit to 5GB
	fileFilter: (req, file, cb) => {
		const isImage = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.mimetype);
		const isVideo = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/x-matroska'].includes(
			file.mimetype,
		);

		if (isImage || isVideo) {
			cb(null, true);
		} else {
			cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Unsupported file type'));
		}
	},
}).fields([
	{ name: 'video', maxCount: 1 },
	{ name: 'photo', maxCount: 1 },
]);

export const resizePhotoDisk = async (req: Request, res: Response, next: NextFunction) => {
	let tempPath = '';
	try {
		if (!req.files || Array.isArray(req.files) || !req.files.photo) {
			return next();
		}

		const photoFile = req.files.photo[0];
		const originalPath = photoFile.path;
		tempPath = originalPath + '_resized';

		await sharp(originalPath)
			.resize(1200, null, {
				fit: 'inside',
				withoutEnlargement: true,
			})
			.webp({ quality: 70 })
			.toFile(tempPath);

		fs.renameSync(tempPath, originalPath);

		const stats = fs.statSync(originalPath);
		req.files.photo[0].size = stats.size;

		next();
	} catch (error) {
		if (tempPath && fs.existsSync(tempPath)) {
			fs.unlinkSync(tempPath);
		}
		next(error);
	}
};
