const { SERVICES_SERVICE } = require('../config/DIKeys');
const appContainer = require('../utils/appContainer');
const servicesService = appContainer.resolve(SERVICES_SERVICE);
const catchAsync = require('../utils/catchAsync');

exports.getServices = catchAsync(async (req, res) => {
    const data = await servicesService.getAllServices();
    res.status(200).json(data);
});

exports.getService = catchAsync(async (req, res) => {
    const { slug } = req.params;
    const data = await servicesService.getOneService(slug);
    res.status(200).json(data);
});