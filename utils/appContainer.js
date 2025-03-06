const db = require('../config/db');
const Container = require('./Container');
const VideoRepository = require('../repositories/VideoRepository');
const VideoService = require('../services/VideoService');
const CommentsRepository = require('../repositories/CommentsRepository');
const CommentsServices = require('../services/CommentsService');

const { 
    VIDEO_REPOSITORY, 
    VIDEO_SERVICE, 
    COMMENTS_REPOSITORY,
    COMMENTS_SERVICE
} = require('../config/DIKeys');

const container = new Container();

container.register(VIDEO_REPOSITORY, new VideoRepository(db));
container.register(VIDEO_SERVICE, new VideoService(container.resolve(VIDEO_REPOSITORY)));
container.register(COMMENTS_REPOSITORY, new CommentsRepository(db));
container.register(COMMENTS_SERVICE, new CommentsServices(container.resolve(COMMENTS_REPOSITORY)));

module.exports = container;