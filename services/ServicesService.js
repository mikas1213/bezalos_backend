const { NotFoundError } = require('../utils/errors');

class ServicesService {
    constructor(servicesRepository) {
        this.servicesRepository = servicesRepository;
    }

    async getAllServices() {
        const data = await this.servicesRepository.findAll({is_active: true}, undefined, {field: 'sort', direction: 'ASC'});
        if(!data) throw new NotFoundError('Services not found');
        return data;
    }

    async getOneService(slug) {
        const data = await this.servicesRepository.findBySlug(slug);
        if(!data) throw new NotFoundError('Service not found');
        return data;
    } 
    
    async getAllServicesAdmin() {
        const data = await this.servicesRepository.findAllAdmin();
        if(!data) throw new NotFoundError('Services not found');
        return data;
    }

    async addOneService(data) {
        return await this.servicesRepository.create(data);
    }

    async updateOneService(id, fields) {
        return await this.servicesRepository.updateById(id, fields);
    }

    async deleteOneServiceAdmin(id) {
        return await this.servicesRepository.deleteById(id);
    }
}

module.exports = ServicesService;