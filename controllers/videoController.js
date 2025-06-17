const { VIDEO_SERVICE } = require('../config/DIKeys');
const appContainer = require('../utils/appContainer');
const videoService = appContainer.resolve(VIDEO_SERVICE);
const catchAsync = require('../utils/catchAsync');
const VideoDTO = require('../dto/video-create.dto')

exports.getVideos = catchAsync(async (req, res) => {
    const filters = req.query.cat === 'kursai' ? {is_active: true, type: 'kursai'} : {...req.query, is_active: true, type: 'virtuve'};
    const data = await videoService.getAllVideos(filters);
    res.status(200).json(data);
});

exports.getVideo = catchAsync(async (req, res) => {
    const { user_id, params: { video: slug }} = req;
    const data = await videoService.getOneVideo(user_id, slug);
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
    const data = await videoService.getAllVideosAdmin();
    res.status(200).json(data);
});

exports.addVideo = catchAsync(async (req, res) => {
    const socketId = req.headers['x-socket-id'];
    const videoDTO = new VideoDTO(req.body);
    await videoService.addOneVideo(videoDTO, req.files, socketId); 
    res.sendStatus(201);
});

exports.updateVideo = catchAsync(async (req, res) => {
    const { id: video_id } = req.params;
    const socketId = req.headers['x-socket-id'];
    const videoDTO = new VideoDTO(req.body);
    await videoService.updateOneVideo(videoDTO, req.files, video_id, socketId);
    res.sendStatus(201);
});

exports.deleteVideo = catchAsync(async (req, res) => {
    const { video_s3_key, image_s3_key } = req.body;
    const { id } = req.params;
    await videoService.deleteOneVideo(id, video_s3_key, image_s3_key);
    res.sendStatus(204);
});
