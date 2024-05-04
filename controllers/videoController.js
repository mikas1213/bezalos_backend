const db = require('../database/db');
const fs = require('fs');

const { getSignedUrl, getSignedCookies } = require("@aws-sdk/cloudfront-signer");

exports.getKitchenVideos = async (req, res) => {
    
    const { cat = '', search = ''} = req.query;
    
    try {
        const data = await db.query('SELECT id, src, thumb, title, category, created_at FROM videos WHERE video_type = $1 AND search_tag ILIKE $2 AND title ILIKE $3', ['kitchen', `%${cat}%`, `%${search}%`]);
        
        res.status(200).json({
            status: 'success',
            videos: data.rows
        });
    } catch(err) {
        console.log(err.message)
    }
};

exports.getVideos = async (req, res) => {

    try {
        // const data = await db.query('SELECT * FROM users;');

        const privateKey = fs.readFileSync('./private_key.pem', { encoding: 'ascii' });
        
        const url = 'https://d1cupj4wyzfq3d.cloudfront.net/videos/be-zalos-virtuve-qa-01.mp4';
        const signedUrl = getSignedUrl({
            url,
            keyPairId: process.env.CLOUD_FRONT_KEY_PAIR_ID,
            dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
            privateKey,
          });
        res.status(200).json({
            // users: data.rows,
            key: signedUrl
        })
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};