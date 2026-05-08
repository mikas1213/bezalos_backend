import { Command } from '@smithy/smithy-client';
import type { ObjectCannedACL } from '@aws-sdk/client-s3';
export type S3CommandConstructor = new (params: S3Object) => Command<any, any, any>;
export interface S3Object {
	Bucket: string;
	Key: string;
	Body?: Buffer | Uint8Array | string;
	ContentType?: string;
	Metadata?: Record<string, string>;
	CacheControl?: string;
	ACL?: ObjectCannedACL;
}
