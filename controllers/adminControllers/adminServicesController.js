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

exports.updateService = async (req, res) => {    
    try {
        const { id } = req.params;
        const fields = ['title', 'slug', 'base_price', 'quantity', 'discount', 'sort', 'popular', 'is_active', 'grid_desc', 'basic_desc', 'details'];

        if(req.file) {
            ['image_s', 'image_m', 'image_l'].forEach(field => fields.push(field));
        }

        const query_values = fields.map(field => req.body[field]);
        const query_fields = fields.map((field, i) => `${field} = $${i+1}`).join(', ');
        query_values.push(id);
        const query_string = `UPDATE services SET ${query_fields} WHERE id = $${query_values.length}`;
        console.log(query_fields)
        console.log(query_values)
        
        
        await db.query(query_string, query_values);
        // await servicesService.updateOneService(id, fields);
        res.sendStatus(200);
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
};

