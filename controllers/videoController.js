const { VIDEO_SERVICE, S3_SERVICE } = require('../config/DIKeys');
const appContainer = require('../utils/appContainer');
const videoService = appContainer.resolve(VIDEO_SERVICE);
const s3Service = appContainer.resolve(S3_SERVICE);
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

exports.updateVideoPlayCount = catchAsync(async (req, res) => {
    const { id: video_id } = req.params;
    const { data: column } = req.body;
    
    await videoService.updateOneVideoPlayCount(video_id, column);
    res.sendStatus(204);
});


/* - - - A D M I N   C O N T R O L L E R S - - - */
exports.getVideosAdmin = catchAsync(async (req, res) => {
    const images = await s3Service.getAllImages({ 
        Bucket: process.env.AWS_BUCKET_NAME,
        Prefix: 'images/recipes/'
    });

    const data = await videoService.getAllVideosAdmin();
    res.status(200).json({data, images});
});

exports.deleteVideo = catchAsync(async (req, res) => {
    const { id } = req.params;
    await videoService.deleteOneVideo(id);
    res.sendStatus(204);
});
