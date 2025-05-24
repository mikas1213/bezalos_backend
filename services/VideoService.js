const { NotFoundError } = require('../utils/errors');
const fs = require('fs');
const path = require('path');
const { getSignedUrl, getSignedCookies } = require('@aws-sdk/cloudfront-signer');
// const axios = require('axios');

class VideoService {
    constructor(videoRepository) {
        this.videoRepository = videoRepository;
    }
    /**
        * this.videoRepository.findAll()
        * 
        * @param {Object} filters - Filtrai, kurie bus konvertuoti į WHERE sąlygas.
        * @param {Array<string>} [fields=['*']] - Laukai, kurie bus įtraukti į SELECT užklausą.
        * @param {Object} [sortOptions=null] - Rūšiavimo nustatymai.
        * @param {string} sortOptions.field - Laukas, pagal kurį rūšiuoti.
        * @param {string} [sortOptions.direction='ASC'] - Rūšiavimo kryptis ('ASC' arba 'DESC').
        * @param {Object} [pagination=null] - Puslapiavimo nustatymai.
        * @param {number} [pagination.limit] - Maksimalus grąžinamų įrašų skaičius.
        * @param {number} [pagination.offset] - Kiek įrašų praleisti.
        * @returns {Promise<Array>} Grąžina gautų duomenų masyvą.
        * @throws {DatabaseError} Jei įvyksta klaida vykdant užklausą.
    */
    async getAllVideosAdmin() {
        const data = await this.videoRepository.findAllAdmin();
        if(!data) throw new NotFoundError('Video rasti nepavyko');
        return data;
    }

    async getAllVideos(filters) {
        const data = await this.videoRepository.findAll(filters, undefined, {field: 'created_at', direction: 'DESC'});
        if(!data) throw new NotFoundError('Video rasti nepavyko');
        return data;
    }

    generateSignedUrl(s3_video_file_name) {
        if (!s3_video_file_name) return null;

        const file_path = path.join(__dirname, '..', 'private_key.pem');
        const privateKey = fs.readFileSync(file_path, { encoding: 'ascii' });
        const s3_video_url = `${process.env.CLOUD_FRONT_DOMAIN_NAME}${process.env.AWS_VIDEOS_FOLDER_NAME}${s3_video_file_name}`;
        
        return getSignedUrl({
            url: s3_video_url, 
            // keyPairId: process.env.CLOUD_FRONT_KEY_PAIR_ID || 'KPQGMPR9KLNK4' ,
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

    async deleteOneVideo(video_id) {
        await this.videoRepository.deleteById(video_id);
    }
}

module.exports = VideoService;