// const { NotFoundError, ValidationError } = require('../utils/errors');
const fs = require('fs');

class VideoService {
	constructor(videoRepository, s3Service) {
		this.videoRepository = videoRepository;
		this.s3Service = s3Service;
	}
	/**
	 * this.videoRepository.findAll()
	 *
	 * @param {Object} filters - Filtrai, kurie bus konvertuoti į WHERE sąlygas.
	 * @param {Array<string>} [fields=['*']] - Laukai, kurie bus įtraukti į SELECT užklausą.
	 * @param {Object} [sortOptions=null] - Rūšiavimo nustatymai.
	 * @param {string} sortOptions.field - Laukas, pagal kurį rūšiuoti.
	 * @param {string} [sortOptions.direction='ASC'] - Rūšiavimo kryptis ('ASC' arba 'DESC').
	 * @param {Object} [pagination=null] - Puslapiavimo nustatymai.
	 * @param {number} [pagination.limit] - Maksimalus grąžinamų įrašų skaičius.
	 * @param {number} [pagination.offset] - Kiek įrašų praleisti.
	 * @returns {Promise<Array>} Grąžina gautų duomenų masyvą.
	 * @throws {DatabaseError} Jei įvyksta klaida vykdant užklausą.
	 */
	// async getAllVideosAdmin() {
	// 	return await this.videoRepository.findAllAdmin();
	// }

	// async getAllVideos(filters) {
	// 	const data = await this.videoRepository.findAll(filters, undefined, {
	// 		field: 'created_at',
	// 		direction: 'DESC',
	// 	});
	// 	if (!data || !Array.isArray(data)) throw new NotFoundError('Video rasti nepavyko');
	// 	return data;
	// }

	// async getOneVideo(user_id, slug) {
	//     const data = await this.videoRepository.findById(user_id, slug);
	//     if(!data) throw new NotFoundError('Video įrašo rasti nepavyko');

	//     data.s3_video_url = this.s3Service.generateSignedUrl(data.video_s3_key);
	//     return data;
	// }

	// async updateOneVideoPlayCount(video_id, column) {
	// 	await this.videoRepository.updateVideoPlayCount(video_id, column);
	// }

	async addOneVideo(videoDTO, files, socketId) {
		// INSERT DATA TO DB
		const videoFile = files.video[0];
		const photoFile = files.photo[0];
		const video_extention = videoFile.originalname.split('.').pop();
		const image_extention = photoFile.originalname.split('.').pop();

		const videoData = {
			...videoDTO,
			image_s3_key: `${process.env.AWS_FOLDER_NAME}/images/virtuve-video-covers/${videoDTO.slug}.${image_extention}`,
			video_s3_key: `${process.env.AWS_FOLDER_NAME}/videos/virtuve/${videoDTO.slug}.${video_extention}`,
		};
		const [{ id: video_id }] = await this.videoRepository.create(videoData);

		try {
			console.log('addOneVideo Try');
			// UPLOAD PHOTO FILE TO AWS S3
			await this.s3Service.uploadFileDisk(photoFile, videoData.image_s3_key, video_id);

			// UPLOAD VIDEO FILE TO AWS S3
			await this.s3Service.uploadVideo(videoFile, videoData.video_s3_key, video_id, socketId);
		} catch (err) {
			console.log('addOneVideo catch: ', err);
			// DELETE VIDEO FROM DISK
			if (videoFile.path && fs.existsSync(videoFile.path)) {
				fs.unlinkSync(videoFile.path);
			}

			// DELETE PHOTO FROM DISK
			if (photoFile.path && fs.existsSync(photoFile.path)) {
				fs.unlinkSync(photoFile.path);
			}

			// DELETE IMAGE FROM AWS S3
			await this.s3Service.deleteFile({
				Bucket: process.env.AWS_BUCKET_NAME,
				Key: videoData.image_s3_key,
			});

			// DELETE VIDEO FROM AWS S3
			await this.s3Service.deleteFile({
				Bucket: process.env.AWS_BUCKET_NAME,
				Key: videoData.video_s3_key,
			});

			// DELETE DATA FROM DB
			await this.videoRepository.deleteById(video_id);

			if (socketId && global.io) {
				global.io.to(socketId).emit('uploadError', {
					message: 'Video įkėlimas nepavyko',
				});
			}
			throw err;
		}
	}

	async updateOneVideo(videoDTO, files, video_id, socketId) {
		const { video, photo } = files;
		const updatedData = { ...videoDTO };
		const old_slug = updatedData.video_s3_key.split('/').pop().split('.').shift();

		let video_extention = videoDTO.video_s3_key.split('.').pop();
		let image_extention = videoDTO.image_s3_key.split('.').pop();

		if (video) video_extention = video[0].originalname.split('.').pop();
		if (photo) image_extention = photo[0].originalname.split('.').pop();

		updatedData.image_s3_key = `${process.env.AWS_FOLDER_NAME}/images/virtuve-video-covers/${updatedData.slug}.${image_extention}`;
		updatedData.video_s3_key = `${process.env.AWS_FOLDER_NAME}/videos/virtuve/${updatedData.slug}.${video_extention}`;

		// IF THE NAME HAS NOT BEEN CHANFED
		if (old_slug !== updatedData.slug) {
			if (!video) {
				await this.s3Service.renameFile({
					Bucket: process.env.AWS_BUCKET_NAME,
					CopySource: `${process.env.AWS_BUCKET_NAME}/${videoDTO.video_s3_key}`,
					Key: updatedData.video_s3_key,
					Old_Key: videoDTO.video_s3_key,
				});
			} else {
				await this.s3Service.deleteFile({
					Bucket: process.env.AWS_BUCKET_NAME,
					Key: videoDTO.video_s3_key,
				});
				await this.s3Service.uploadVideo(video[0], updatedData.video_s3_key, video_id, socketId);
			}

			if (!photo) {
				await this.s3Service.renameFile({
					Bucket: process.env.AWS_BUCKET_NAME,
					CopySource: `${process.env.AWS_BUCKET_NAME}/${videoDTO.image_s3_key}`,
					Key: updatedData.image_s3_key,
					Old_Key: videoDTO.image_s3_key,
				});
			} else {
				await this.s3Service.deleteFile({
					Bucket: process.env.AWS_BUCKET_NAME,
					Key: videoDTO.image_s3_key,
				});
				await this.s3Service.uploadFileDisk(photo[0], updatedData.image_s3_key, video_id);
			}
		} else if (video || photo) {
			if (video) {
				await this.s3Service.deleteFile({
					Bucket: process.env.AWS_BUCKET_NAME,
					Key: videoDTO.video_s3_key,
				});
				await this.s3Service.uploadVideo(video[0], updatedData.video_s3_key, video_id, socketId);
			}

			if (photo) {
				await this.s3Service.deleteFile({
					Bucket: process.env.AWS_BUCKET_NAME,
					Key: videoDTO.image_s3_key,
				});
				await this.s3Service.uploadFileDisk(photo[0], updatedData.image_s3_key, video_id);
			}
		}

		await this.videoRepository.updateById(video_id, updatedData);
	}

	async deleteOneVideo(video_id, video_s3_key, image_s3_key) {
		await this.s3Service.deleteFile({
			Bucket: process.env.AWS_BUCKET_NAME,
			Key: image_s3_key,
		});
		await this.s3Service.deleteFile({
			Bucket: process.env.AWS_BUCKET_NAME,
			Key: video_s3_key,
		});
		await this.videoRepository.deleteById(video_id);
	}
}

module.exports = VideoService;
