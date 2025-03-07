const { NotFoundError } = require('../utils/errors');

class RecipesService {
    constructor(recipesRepository) {
        this.recipesRepository = recipesRepository;
    }

    async getAllRecipes() {
        const data = await this.recipesRepository.findAll();
        if(!data) throw new NotFoundError('Receptų rasti nepavyko');
        return data;
    }
}

module.exports = RecipesService;