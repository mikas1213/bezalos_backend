const { NotFoundError } = require('../utils/errors');
const fs = require('fs');
const path = require('path');
const { getSignedUrl, getSignedCookies } = require('@aws-sdk/cloudfront-signer');
const axios = require('axios');

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
            // dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
            dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 3),
            privateKey,
        });
    }
    
    async getOneVideo(user_id, video_url) {
        
        const data = await this.videoRepository.findById(user_id, video_url);
        
        if(!data) throw new NotFoundError('Video įrašo rasti nepavyko');
        data.s3_video_url = this.generateSignedUrl(data.s3_file_name);
        
        return data;
    }   

    async streamVideo(user_id, video_url, res) {
        try {
            // Gauname video duomenis iš repozitorijos
            const data = await this.videoRepository.findById(user_id, video_url);
            
            if(!data) throw new NotFoundError('Video įrašo rasti nepavyko');
            
            // Gauname pasirašytą URL
            const signedUrl = this.generateSignedUrl(data.s3_file_name);
            
            // Nustatome HTTP antraštes, kad išvengtume parsisiuntimo
            res.setHeader('Content-Type', 'video/mp4');
            res.setHeader('Content-Disposition', 'inline'); // Nurodo naršyklei rodyti, o ne parsisiųsti
            res.setHeader('Cache-Control', 'no-store, private');
            res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Neleidžia įkelti video į iFrames iš kitų domenų
            res.setHeader('X-Content-Type-Options', 'nosniff'); // Papildoma apsauga
            res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
            
            // Perduodame video srautą nuo CloudFront į kliento atsakymą
            const response = await axios({
                method: 'get',
                url: signedUrl,
                responseType: 'stream',
            });
            
            // Perduodame srautą į kliento atsakymą
            response.data.pipe(res);
            
        } catch (error) {
            console.error('Klaida transliuojant video:', error);
            
            // Tikriname, ar antraštės dar nebuvo išsiųstos
            if (!res.headersSent) {
                res.status(500).json({ message: 'Nepavyko transliuoti video' });
            }
        }
    }
}

module.exports = VideoService;