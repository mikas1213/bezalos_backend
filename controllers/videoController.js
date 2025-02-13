const db = require('../database/db');
const fs = require('fs');
const path = require('path');


const { getSignedUrl, getSignedCookies } = require("@aws-sdk/cloudfront-signer");

exports.getKitchenVideos = async (req, res) => {
    const { cat = '', search = ''} = req.query;
    
    try {
        const data = await db.query('SELECT id, video_url, title, category, description, search_tag, duration, created_at FROM videos WHERE video_type = $1 AND search_tag ILIKE $2 AND title ILIKE $3 ORDER BY created_at DESC', ['virtuve', `%${cat}%`, `%${search}%`]);
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

        const data = await db.query('SELECT videos.id, video_type, video_url, s3_file_name, title, description, category, duration, videos.created_at, json_agg(comments ORDER BY comments.created_at DESC) AS video_comments FROM videos LEFT JOIN comments ON videos.id = comments.video_id WHERE video_type = $1 AND videos.video_url = $2 GROUP BY videos.id;', ['virtuve', req.params.video]);
        let likes_count = 0;
        let is_liked = false;

        if(data.rows[0]) {
            const likes_c = await db.query('SELECT COUNT(*) FROM likes_videos WHERE video_id = $1', [data.rows[0].id]);
            likes_count = likes_c.rows[0].count;

            const is_l = await db.query('SELECT COUNT(*) FROM likes_videos WHERE video_id = $1 AND user_id = $2', [data.rows[0].id, req.user_id]);
            is_liked = !!+is_l.rows[0].count; // + convert from string to integer, !! convert to boolean  
        }
        
        
        let s3_url = '';
        if(data.rows.length > 0) {
            s3_url = data.rows[0].s3_file_name;
        } else {
            return res.status(500).json({message: 'Tokio video rasti nepavyko', videos: data.rows});
        }
        const file_path = path.join(__dirname, '..', 'private_key.pem');
        const privateKey = fs.readFileSync(file_path, { encoding: 'ascii' });
        
        const url = `https://d1cupj4wyzfq3d.cloudfront.net/videos/${s3_url}`;
        const signedUrl = getSignedUrl({
            url,
            keyPairId: process.env.CLOUD_FRONT_KEY_PAIR_ID || 'KPQGMPR9KLNK4',
            dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
            privateKey,
        });

        res.status(200).json({
            url: signedUrl,
            video: data.rows[0],
            likes_count,
            is_liked
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({message: err.message});
    }
};

exports.addVideoComment = async (req, res) => {
    const {id, video_id, user_id, user_name, comment} = req.body;
    try {
        await db.query('INSERT INTO comments(id, video_id, user_id, user_name, comment) values($1, $2, $3, $4, $5)', [id, video_id, user_id, user_name, comment]);
        res.status(201).json({
            status: 'success',
        });
        
    } catch (err) {
        console.log('Error from addVideoComment', err.message)
    }
}

exports.deleteVideoComment = async (req, res) => {
    const { user_id } = req;
    const { id } = req.params;
    try {
        const { rows } = await db.query('SELECT user_id FROM comments WHERE id = $1', [id]);
        if(rows.length > 0) {
            const c_user_id = rows[0]?.user_id;
            if(user_id !== c_user_id) {
                return res.status(403).json({ message: 'Not authorized to remove this comment' });
            }
        } else {
            return res.status(404).json({ message: 'Comment not found' });
        }
        
        await db.query('DELETE FROM comments WHERE id = $1', [id]);
        return res.sendStatus(204);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};
