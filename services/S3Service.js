const { S3Client, PutObjectCommand, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadObjectCommand } = require('@aws-sdk/client-s3');
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

    async getAllImages(params) {
        const { Bucket, Prefix = 'images/', metadataFilter = null } = params;
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp', '.svg'];
        
        try {
            const allObjects = [];
            let continuationToken;

            // 1. Gauti visus failus
            do {
                const listParams = {
                    Bucket,
                    Prefix,
                    ...(continuationToken && { ContinuationToken: continuationToken })
                };

                const response = await this.sendCommand(ListObjectsV2Command, listParams);
                
                if (response.Contents) {
                    const images = response.Contents.filter(obj => 
                        imageExtensions.some(ext => 
                            obj.Key.toLowerCase().endsWith(ext)
                        )
                    );
                    
                    allObjects.push(...images);
                }

                continuationToken = response.NextContinuationToken;
            } while (continuationToken);

            // 2. Jei reikia filtruoti pagal metadata
            if (metadataFilter) {
                const filteredImages = [];
                
                for (const obj of allObjects) {
                    try {
                        const headResponse = await this.sendCommand(HeadObjectCommand, {
                            Bucket,
                            Key: obj.Key
                        });
                        
                        // Tikrinti metadata
                        if (this.matchesMetadataFilter(headResponse.Metadata, metadataFilter)) {
                            filteredImages.push({
                                ...obj,
                                metadata: headResponse.Metadata
                            });
                        }
                    } catch (err) {
                        // Jei nepavyksta gauti metadata, praleisti failą
                        console.warn(`Could not get metadata for ${obj.Key}:`, err.message);
                    }
                }
                
                return filteredImages;
            }

            return allObjects;
        } catch (err) {
            throw new S3_Error(`Failed to get images: ${err.message}`);
        }
    }

    matchesMetadataFilter(metadata, filter) {
        if (!metadata) return false;
        
        for (const [key, value] of Object.entries(filter)) {
            // AWS meta raktai yra lowercase ir be x-amz-meta- prefix
            const metaKey = key.replace('x-amz-meta-', '').toLowerCase();
            
            if (!metadata[metaKey] || metadata[metaKey] !== value) {
                return false;
            }
        }
        
        return true;
    }
    
}

module.exports = S3Service;

