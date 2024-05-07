const db = require('../database/db');
const fs = require('fs');

const { getSignedUrl, getSignedCookies } = require("@aws-sdk/cloudfront-signer");

exports.getKitchenVideos = async (req, res) => {
    
    const { cat = '', search = ''} = req.query;
    
    try {
        const data = await db.query('SELECT id, s3_file_name, video_url, title, category, description, search_tag, created_at FROM videos WHERE video_type = $1 AND search_tag ILIKE $2 AND title ILIKE $3', ['virtuve', `%${cat}%`, `%${search}%`]);
        
        res.status(200).json({
            status: 'success',
            videos: data.rows
        });
    } catch(err) {
        console.log(err.message)
    }
};

exports.getKitchenVideo = async (req, res) => {
    
    try {
        const data = await db.query('SELECT * FROM videos WHERE video_url = $1', [req.params.video]);
        let s3_url = '';
        if(data.rows[0]) s3_url = data.rows[0].s3_file_name;
        console.log('s3_url: ', s3_url)
        const privateKey = fs.readFileSync('./private_key.pem', { encoding: 'ascii' });
        const url = `https://d1cupj4wyzfq3d.cloudfront.net/videos/${s3_url}`;
        const signedUrl = getSignedUrl({
            url,
            keyPairId: process.env.CLOUD_FRONT_KEY_PAIR_ID || 'KPQGMPR9KLNK4',
            dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
            privateKey,
          });
        console.log('privateKey: ', privateKey);
        console.log('key: ', process.env.CLOUD_FRONT_KEY_PAIR_ID)
        res.status(200).json({
            // users: data.rows,
            url: signedUrl,
            data: data.rows[0]
        })
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};