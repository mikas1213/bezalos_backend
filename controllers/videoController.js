const db = require('../database/db');
const fs = require('fs');

const { getSignedUrl, getSignedCookies } = require("@aws-sdk/cloudfront-signer");

exports.getKitchenVideos = async (req, res) => {
    const { cat = '', search = ''} = req.query;
    
    try {
        const data = await db.query('SELECT id, video_url, title, category, description, created_at FROM videos WHERE video_type = $1 AND search_tag ILIKE $2 AND title ILIKE $3 ORDER BY created_at DESC', ['virtuve', `%${cat}%`, `%${search}%`]);
        
        res.status(200).json({
            status: 'success',
            videos: data.rows,
        });
    } catch(err) {
        console.log(err.message)
    }
};

exports.getKitchenVideo = async (req, res) => {
    

    try {
        const data = await db.query('SELECT id, video_type, video_url, s3_file_name, search_tag, title, description, category, duration, videos.created_at, json_agg(comments) as video_comments FROM videos LEFT JOIN comments ON comments.video_id = videos.id where video_type = $1  GROUP BY videos.id ORDER BY videos.created_at DESC;', ['virtuve']);
        const video = data.rows.find(video => video.video_url === req.params.video);
        const video_id = video.id;
        const users = await db.query('SELECT id, name FROM users WHERE id IN (SELECT comments.user_id FROM comments WHERE id = comments.user_id AND comments.video_id = $1)', [video_id]);
        
        let s3_url = '';
        if(video) {
            s3_url = video.s3_file_name;
        } else {
            return res.status(500).json({message: 'Tokio video rasti nepavyko', videos: data.rows});
        }
        
        const privateKey = fs.readFileSync('./private_key.pem', { encoding: 'ascii' });
        const url = `https://d1cupj4wyzfq3d.cloudfront.net/videos/${s3_url}`;
        const signedUrl = getSignedUrl({
            url,
            keyPairId: process.env.CLOUD_FRONT_KEY_PAIR_ID || 'KPQGMPR9KLNK4',
            dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
            privateKey,
        });

        res.status(200).json({
            url: signedUrl,
            videos: data.rows,
            users: users.rows
        })
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};