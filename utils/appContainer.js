const db = require('../config/db');
const Container = require('./Container');
const SitemapService = require('../services/SitemapService');
const VideoRepository = require('../repositories/VideoRepository');
const VideoService = require('../services/VideoService');
const CommentsRepository = require('../repositories/CommentsRepository');
const CommentsServices = require('../services/CommentsService');
const RecipesRepository = require('../repositories/RecipesRepository');
const RecipesServices = require('../services/RecipesService');
const ServicesRepository = require('../repositories/ServicesReposotory');
const ServicesService = require('../services/ServicesService');
const LikesRepository = require('../repositories/LikesRepository');
const LikesService = require('../services/LikesService');
const S3Service = require('../services/S3Service');

const { 
    VIDEO_REPOSITORY, 
    VIDEO_SERVICE, 
    COMMENTS_REPOSITORY,
    COMMENTS_SERVICE,
    RECIPES_REPOSITORY,
    RECIPES_SERVICE,
    SERVICES_REPOSITORY,
    SERVICES_SERVICE,
    LIKES_REPOSITORY,
    LIKES_SERVICE,
    S3_SERVICE,
    SITEMAP_SERVICE
} = require('../config/DIKeys');

const container = new Container();

container.register(S3_SERVICE, new S3Service());
container.register(VIDEO_REPOSITORY, new VideoRepository(db));
container.register(VIDEO_SERVICE, new VideoService(
    container.resolve(VIDEO_REPOSITORY),
    container.resolve(S3_SERVICE)
));
container.register(COMMENTS_REPOSITORY, new CommentsRepository(db));
container.register(COMMENTS_SERVICE, new CommentsServices(container.resolve(COMMENTS_REPOSITORY)));
container.register(RECIPES_REPOSITORY, new RecipesRepository(db));
container.register(RECIPES_SERVICE, new RecipesServices(container.resolve(RECIPES_REPOSITORY)));
container.register(SERVICES_REPOSITORY, new ServicesRepository(db));
container.register(SERVICES_SERVICE, new ServicesService(container.resolve(SERVICES_REPOSITORY)));
container.register(LIKES_REPOSITORY, new LikesRepository(db));
container.register(LIKES_SERVICE, new LikesService(container.resolve(LIKES_REPOSITORY)));
container.register(SITEMAP_SERVICE, new SitemapService(
    container.resolve(RECIPES_REPOSITORY),
    container.resolve(SERVICES_REPOSITORY)
));

module.exports = container;