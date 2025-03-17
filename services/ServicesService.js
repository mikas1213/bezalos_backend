const { NotFoundError } = require('../utils/errors');

class ServicesService {
    constructor(servicesRepository) {
        this.servicesRepository = servicesRepository;
    }

    async getAllServices() {
        const data = await this.servicesRepository.findAll({is_active: true});
        if(!data) throw new NotFoundError('Services not found');
        return data;
    }

    async getOneService(slug) {
        const data = await this.servicesRepository.findBySlug(slug);
        if(!data) throw new NotFoundError('Service not found');
        return data;
    } 
}

module.exports = ServicesService;