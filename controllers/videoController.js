const db = require('../database/db');
const fs = require('fs');

const { getSignedUrl, getSignedCookies } = require("@aws-sdk/cloudfront-signer");

exports.getKitchenVideos = async (req, res) => {
    const { cat = '', search = ''} = req.query;
    
    try {
        const data = await db.query('SELECT * FROM videos WHERE video_type = $1 AND search_tag ILIKE $2 AND title ILIKE $3', ['virtuve', `%${cat}%`, `%${search}%`]);
        // const test_data = await db.query('SELECT * FROM videos LEFT JOIN comments ON videos.id = comments.video_id;');
        // const test_data = await db.query('SELECT id, video_url, title, json_agg(comments) as kamentarai FROM videos LEFT JOIN comments ON comments.video_id = videos.id GROUP BY videos.id');
        
        res.status(200).json({
            status: 'success',
            videos: data.rows,
            // test: test_data.rows
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
        const privateKey = fs.readFileSync('./private_key.pem', { encoding: 'ascii' });
        const url = `https://d1cupj4wyzfq3d.cloudfront.net/videos/${s3_url}`;
        const signedUrl = getSignedUrl({
            url,
            keyPairId: process.env.CLOUD_FRONT_KEY_PAIR_ID || 'KPQGMPR9KLNK4',
            dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
            privateKey,
        });

        res.status(200).json({// users: data.rows,
            url: signedUrl,
            data: data.rows[0]
        })
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};