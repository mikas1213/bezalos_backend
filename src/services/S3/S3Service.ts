import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import type { S3Object, S3CommandConstructor } from './tyeps';
import { AppError } from '../../common/errors/AppError';
import fs from 'fs';
import path from 'path';

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
}
