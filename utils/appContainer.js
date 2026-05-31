const db = require('../config/db');
const Container = require('./Container');
const RecipesRepository = require('../repositories/RecipesRepository');
const RecipesServices = require('../services/RecipesService');
const ServicesRepository = require('../repositories/ServicesReposotory');
const ServicesService = require('../services/ServicesService');
const S3Service = require('../services/S3Service');

const { RECIPES_REPOSITORY, RECIPES_SERVICE, SERVICES_REPOSITORY, SERVICES_SERVICE, S3_SERVICE } = require('../config/DIKeys');

const container = new Container();

container.register(S3_SERVICE, new S3Service());
container.register(RECIPES_REPOSITORY, new RecipesRepository(db));
container.register(RECIPES_SERVICE, new RecipesServices(container.resolve(RECIPES_REPOSITORY)));
container.register(SERVICES_REPOSITORY, new ServicesRepository(db));
container.register(SERVICES_SERVICE, new ServicesService(container.resolve(SERVICES_REPOSITORY)));

module.exports = container;
