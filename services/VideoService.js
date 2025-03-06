const { NotFoundError } = require('../utils/errors');
const fs = require('fs');
const path = require('path');
const { getSignedUrl, getSignedCookies } = require('@aws-sdk/cloudfront-signer');

class VideoService {
    constructor(videoRepository) {
        this.videoRepository = videoRepository;
    }

    async getAllVideos(filters) {
        const data = await this.videoRepository.findAll(filters);

        if(!data) throw new NotFoundError('Video rasti nepavyko');
        return data;
    }

    generateSignedUrl(s3_video_file_name) {
        if (!s3_video_file_name) return null;

        const file_path = path.join(__dirname, '..', 'private_key.pem');
        const privateKey = fs.readFileSync(file_path, { encoding: 'ascii' });
        const s3_video_url = `https://d1cupj4wyzfq3d.cloudfront.net/videos/${s3_video_file_name}`;
        
        return getSignedUrl({
            url: s3_video_url, 
            keyPairId: process.env.CLOUD_FRONT_KEY_PAIR_ID,
            dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
            privateKey,
        });
    }
    
    async getOneVideo(user_id, video_url) {
        const data = await this.videoRepository.findById(user_id, video_url);
        
        if(!data) throw new NotFoundError('Video įrašo rasti nepavyko');
        data.s3_video_url = this.generateSignedUrl(data.s3_file_name);
        return data;
    }   
}

module.exports = VideoService;