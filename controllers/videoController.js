const { VIDEO_SERVICE } = require('../config/DIKeys');
const appContainer = require('../utils/appContainer');
const videoService = appContainer.resolve(VIDEO_SERVICE);
const catchAsync = require('../utils/catchAsync');

exports.getVideos = catchAsync(async (req, res) => {
    const filters = req.query.cat === 'kursai' ? {type: 'kursai'} : {...req.query, type: 'virtuve'};
    const data = await videoService.getAllVideos(filters);
    res.status(200).json(data);
});

exports.getVideo = catchAsync(async (req, res) => {
    const { user_id, params: { video: video_url }} = req;
    const data = await videoService.getOneVideo(user_id, video_url);
    res.status(200).json(data);
});