const { NotFoundError } = require('../utils/errors');

class RecipesService {
    constructor(recipesRepository) {
        this.recipesRepository = recipesRepository;
    }

    async getFavoriteRecipes() {
        const data = await this.recipesRepository.findAllFavorites();
        if(data.length === 0) throw new NotFoundError('Nėra mėgstamiausių receptų');
        return data;
    }

    async getRecipeWithProducts(slug) {
        const data = await this.recipesRepository.findRecipeWithProductsBySlug(slug);
        if(!data) throw new NotFoundError('Receptų rasti nepavyko');
        return data;
    }

    // async getAllRecipes() {
    //     const data = await this.recipesRepository.findAll();
    //     if(!data) throw new NotFoundError('Receptų rasti nepavyko');
    //     return data;
    // }
}

module.exports = RecipesService;