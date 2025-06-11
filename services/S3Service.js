const { 
    S3Client, 
    PutObjectCommand, 
    GetObjectCommand, 
    CopyObjectCommand, 
    ListObjectsV2Command,
    HeadObjectCommand,
    DeleteObjectCommand 
} = require('@aws-sdk/client-s3');
const { Upload } =  require('@aws-sdk/lib-storage');
const { getSignedUrl } = require('@aws-sdk/cloudfront-signer');

const { S3_Error, NotFoundError } = require('../utils/errors');

const fs = require('fs');
const path = require('path');

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

    generateSignedUrl(video_s3_key) {
        
        if (!video_s3_key) return null;
        const file_path = path.join(__dirname, '..', 'cf_bezalos_private_key.pem');
        const privateKey = fs.readFileSync(file_path, { encoding: 'ascii' });
        const cf_video_url = `${process.env.CLOUD_FRONT_DOMAIN_NAME}/${video_s3_key}`;            
        
        return getSignedUrl({
            url: cf_video_url, 
            keyPairId: process.env.CLOUD_FRONT_KEY_PAIR_ID,
            dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
            privateKey
        });
    }

    async uploadFile(params) {
        const uploadParams = { ...params, CacheControl: 'max-age=31536000', ACL: 'public-read' };
        await this.sendCommand(PutObjectCommand, uploadParams);
    }

    async uploadFileDisk(photoFile, key, video_id) {
        try {
            const fileContent = fs.readFileSync(photoFile.path);
            const uploadParams = { 
                Bucket: process.env.AWS_BUCKET_NAME, 
                Key: key, 
                Body: fileContent, 
                ContentType: photoFile.mimetype,
                Metadata: { video_id, host: process.env.PROJECT},
                // CacheControl: 'max-age=31536000', 
                CacheControl: 'no-cache, must-revalidate',
                ACL: 'public-read' 
            };

            await this.sendCommand(PutObjectCommand, uploadParams);
            fs.unlinkSync(photoFile.path);

        } catch (err) {
            if (photoFile.path && fs.existsSync(photoFile.path)) {
                fs.unlinkSync(photoFile.path);
            }
            throw new S3_Error(`Failed to upload photo: ${err.message}`);
        }
    }

    async uploadVideo(videoFile, key, video_id, socketId = null) {
        try {
            if (socketId && global.io) {
                global.io.to(socketId).emit('uploadStageChange', {
                    stage: 'starting-video-upload',
                    message: 'Pradedamas video įkėlimas į AWS S3...'
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
                    Metadata: { video_id, host: process.env.PROJECT},
                },
                queueSize: 4,
                partSize: 10 * 1024 * 1024 // 10MB chunk’ai
            });

            upload.on('httpUploadProgress', progress => {
                const percentage = Math.round((progress.loaded / progress.total) * 100);
                const completed = Math.floor(percentage / 2); // 50 simbolių ilgio bar
                const remaining = 50 - completed;
                const progressBar = '-'.repeat(completed)+'>' + ' '.repeat(remaining);
                const loadedMB = (progress.loaded / (1024 * 1024)).toFixed(1);
                const totalMB = (progress.total / (1024 * 1024)).toFixed(1);
                const label = percentage === 100 ? 'Done!' : 'Uploading...';

                process.stdout.write(`\r${label} |${progressBar}| ${percentage}%`);
                
                if (socketId && global.io) {
                    global.io.to(socketId).emit('videoUploadProgress', {
                        percentage,
                        loadedMB,
                        totalMB
                    });
                }
            });
            const result = await upload.done();

            // Pranešti kad video upload baigtas
            if (socketId && global.io) {
                global.io.to(socketId).emit('videoUploadComplete', {
                    s3Key: result.Key,
                    s3Bucket: result.Bucket
                });
            }

            fs.unlinkSync(videoFile.path); // Remove the file after upload

            return {
                key: result.Key,     // S3 saugojimo kelias
                bucket: result.Bucket
            };
        } catch (err) {
            if (videoFile.path && fs.existsSync(videoFile.path)) {
                fs.unlinkSync(videoFile.path);
            }

            if (socketId && global.io) {
                global.io.to(socketId).emit('uploadError', {
                    message: 'Video įkėlimas nepavyko'
                });
            }
            throw err;
        }
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
            const metaKey = key.replace('x-amz-meta-', '').toLowerCase();
            
            if (!metadata[metaKey] || metadata[metaKey] !== value) {
                return false;
            }
        }
        
        return true;
    }
    
}

module.exports = S3Service;

