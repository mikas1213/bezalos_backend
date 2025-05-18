const { S3Client, PutObjectCommand, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { S3_Error, NotFoundError } = require('../utils/errors');

class S3Service {
    constructor() {
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
    }

    async sendCommand(CommandClass, params) {
        try {
            return await this.s3Client.send(new CommandClass(params));
        } catch (err) {
            throw new S3_Error(err.message);
        }
    }

    async isFileExist(params) {
        try {
            await this.sendCommand(GetObjectCommand, params);
            return true;
        } catch (err) {
            return false;
        }
    }

    async uploadFile(params) {
        const uploadParams = { ...params, CacheControl: 'max-age=31536000', ACL: 'public-read' };
        await this.sendCommand(PutObjectCommand, uploadParams);
    }

    async deleteFile(params) {
        if (!params.Key) throw new NotFoundError('Key is required for S3 deletion');
        await this.sendCommand(DeleteObjectCommand, params);
    }

    async renameFile(params) {
        const {Bucket, CopySource, Key, Old_Key} = params;

        const copyParams = {
            Bucket, CopySource, Key,
            ACL: 'public-read',
            MetadataDirective: 'COPY'
        };

        const copyCommand = new CopyObjectCommand(copyParams);
        await this.s3Client.send(copyCommand); 
        await this.deleteFile({ Bucket, Key: Old_Key }); 
    }
}

module.exports = S3Service;

