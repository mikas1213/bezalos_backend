import { getSignedUrl } from '@aws-sdk/cloudfront-signer';

import fs from 'fs';
import path from 'path';

export class S3Service {
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
}
