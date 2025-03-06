const db = require('../database/db');

exports.protectDeleteLike = async (req, res, next) => {
    
    try {
        const auth_user_id = req.user_id;
        const { user_id, entity_id, type } = req.body;

        const validTypes = {
            'likes_videos': 'video_id',
            'likes_recipes': 'recipe_id'
        };

        if (!validTypes[type]) {
            return res.status(400).json({ message: 'Invalid like type' });
        }
        const column = validTypes[type];
        const result = await db.query(`SELECT user_id FROM ${type} WHERE user_id = $1 AND ${column} = $2`, [user_id, entity_id]);

        if (result.rowCount > 0) {
            if (auth_user_id !== result.rows[0].user_id) {
                return res.status(403).json({ message: 'Not authorized to remove this like' });
            }
        }

        next();
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};


exports.toggleLikes = async (req, res) => {
    
    const { type, user_id, entity_id } = req.body;
    
    const columns = {
        likes_videos: 'video_id',
        likes_recipes: 'recipe_id'
    };
    
    try {
        const like = await db.query('SELECT toggle_likes($1, $2, $3)', [type, user_id, entity_id]);
        const likes = await db.query(`SELECT COUNT(*) FROM ${type} WHERE ${columns[type]} = $1`, [entity_id]);
        
        return res.status(201).json({
            isLiked: !!+like.rows[0].toggle_likes,
            likesCount: likes.rows[0].count
        });
    } catch (err) {
        console.log('from toggleLikes: ', err.message);
    }
}

