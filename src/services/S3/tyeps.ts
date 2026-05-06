import { Command } from '@smithy/smithy-client';
export type S3CommandConstructor = new (params: S3Object) => Command<any, any, any>;
export interface S3Object {
	Bucket: string;
	Key: string;
}
