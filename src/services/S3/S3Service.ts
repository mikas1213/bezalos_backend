import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
import { S3Client, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import type { S3Object, S3CommandConstructor } from './tyeps';
import { AppError } from '../../common/errors/AppError';
import fs from 'fs';
import path from 'path';
import { Upload } from '@aws-sdk/lib-storage';

export class S3Service {
	private s3Client: S3Client;

	constructor() {
		this.s3Client = new S3Client({
			region: process.env.AWS_REGION,
			credentials: {
				accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
			},
		});
	}

	generateSignedUrl(videoS3Key: string) {
		if (!videoS3Key) return null;

		const file_path = path.join(process.cwd(), 'cf_bezalos_private_key.pem');
		const privateKey = fs.readFileSync(file_path, { encoding: 'ascii' });
		const cf_video_url = `${process.env.CLOUD_FRONT_DOMAIN_NAME}/${videoS3Key}`;

		return getSignedUrl({
			url: cf_video_url,
			keyPairId: process.env.CLOUD_FRONT_KEY_PAIR_ID!,
			dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
			privateKey,
		});
	}

	async sendCommand(CommandClass: S3CommandConstructor, params: S3Object) {
		try {
			return await this.s3Client.send(new CommandClass(params));
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Unknown error';
			throw AppError.internal(message);
		}
	}

	async deleteFile(params: S3Object) {
		if (!params.Key) throw AppError.notFound('Key is required for S3 deletion');
		await this.sendCommand(DeleteObjectCommand, params);
	}

	async uploadVideo(
		videoFile: Express.Multer.File,
		key: string,
		videoId: string,
		socketId: string | null = null,
	): Promise<{ key: string | undefined; bucket: string | undefined }> {
		try {
			if (socketId && global.io) {
				global.io.to(socketId).emit('uploadStageChange', {
					stage: 'starting-video-upload',
					message: 'Pradedamas video įkėlimas į AWS S3...',
				});
			}

			const fileStream = fs.createReadStream(videoFile.path);
			const upload = new Upload({
				client: this.s3Client,
				params: {
					Bucket: process.env.AWS_BUCKET_NAME,
					Key: key,
					Body: fileStream,
					ContentType: videoFile.mimetype,
					ACL: 'private',
					CacheControl: 'no-cache, must-revalidate',
					Metadata: { videoId, host: process.env.PROJECT ?? '' },
				},
				queueSize: 4,
				partSize: 10 * 1024 * 1024, // 10MB chunk’ai
			});

			upload.on('httpUploadProgress', (progress) => {
				const percentage = Math.round(((progress.loaded ?? 0) / (progress.total ?? 1)) * 100);
				const completed = Math.floor(percentage / 2); // 50 simbolių ilgio bar
				const remaining = 50 - completed;
				const progressBar = '-'.repeat(completed) + '>' + ' '.repeat(remaining);
				const loadedMB = ((progress.loaded ?? 0) / (1024 * 1024)).toFixed(1);
				const totalMB = ((progress.total ?? 0) / (1024 * 1024)).toFixed(1);
				const label = percentage === 100 ? 'Done!' : 'Uploading...';

				process.stdout.write(`\r${label} |${progressBar}| ${percentage}%`);

				if (socketId && global.io) {
					global.io.to(socketId).emit('videoUploadProgress', {
						percentage,
						loadedMB,
						totalMB,
					});
				}
			});
			const result = await upload.done();

			// Pranešti kad video upload baigtas
			if (socketId && global.io) {
				global.io.to(socketId).emit('videoUploadComplete', {
					s3Key: result.Key,
					s3Bucket: result.Bucket,
				});
			}

			fs.unlinkSync(videoFile.path); // Remove the file after upload

			return {
				key: result.Key, // S3 saugojimo kelias
				bucket: result.Bucket,
			};
		} catch (err) {
			if (videoFile.path && fs.existsSync(videoFile.path)) {
				fs.unlinkSync(videoFile.path);
			}

			if (socketId && global.io) {
				global.io.to(socketId).emit('uploadError', {
					message: 'Video įkėlimas nepavyko',
				});
			}
			throw err;
		}
	}

	async uploadFileDisk(photoFile: Express.Multer.File, key: string, videoId: string) {
		try {
			const fileContent = fs.readFileSync(photoFile.path);
			const uploadParams = {
				Bucket: process.env.AWS_BUCKET_NAME!,
				Key: key,
				Body: fileContent,
				ContentType: photoFile.mimetype,
				Metadata: { videoId, host: process.env.PROJECT! },
				CacheControl: 'no-cache, must-revalidate',
				ACL: 'public-read' as const,
			};

			await this.sendCommand(PutObjectCommand, uploadParams);
			fs.unlinkSync(photoFile.path);
		} catch (err) {
			if (photoFile.path && fs.existsSync(photoFile.path)) {
				fs.unlinkSync(photoFile.path);
			}
			const message = err instanceof Error ? err.message : 'Unknown error';
			throw AppError.internal(`Failed to upload photo: ${message}`);
		}
	}
}
