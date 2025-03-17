const db = require('../../database/db');
const { SERVICES_SERVICE } = require('../../config/DIKeys');
const appContainer = require('../../utils/appContainer');
const servicesService = appContainer.resolve(SERVICES_SERVICE);
const catchAsync = require('../../utils/catchAsync');
const ServiceDTO = require('../../dto/service-create.dto');

exports.getServicesAdmin = catchAsync(async (req, res) => {
    const data = await servicesService.getAllServicesAdmin();
    res.status(200).json(data);
});

exports.deleteService = catchAsync(async (req, res) => {
    const { id } = req.params;
    await servicesService.deleteOneServiceAdmin(id);
    res.sendStatus(204);
});

exports.addService = catchAsync(async (req, res) => {
    const serviceDTO = new ServiceDTO(req.body);
    await servicesService.addOneService(serviceDTO);
    res.sendStatus(200);
});

exports.updateService = catchAsync(async (req, res) => {    
    const { id } = req.params;
    const serviceDTO = new ServiceDTO(req.body);
    await servicesService.updateOneService(id, serviceDTO);
    res.sendStatus(200);
});

