const { NotFoundError, ValidationError } = require('../utils/errors');

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

    async getAllRecipes(filters, page, limit, user_id) {
        const count_result = await this.recipesRepository.findRecipesCount(filters);
        const total_rows = parseInt(count_result.total, 10);
        const total_pages = Math.ceil(total_rows / limit);
        const offset = (page - 1) * limit;
        
        const data = await this.recipesRepository.findRecipes(filters, limit, offset, user_id);
        if(data.length === 0) throw new NotFoundError('Recipes not found');
        return { data, total_pages, total_rows, current_page: page };
    }

    async addOneRecipe(recipeDTO, products) {
        const is_exist = await this.recipesRepository.checkIsRecipeExist(recipeDTO.slug);
        if(is_exist) throw new ValidationError('Toks pavadinimas jau yra 🍽');
        return await this.recipesRepository.createRecipe(recipeDTO, products);
    }
    async updateOneRecipe(recipe_id, recipeDTO, products) {
        if(!recipe_id) throw new NotFoundError('Recipe not found');
        await this.recipesRepository.updateRecipe(recipe_id, recipeDTO, products);
    }

    async deleteOneRecipe(id) {
        if(!id) throw new NotFoundError('Recipe not found');
        await this.recipesRepository.deleteById(id);
    }
}

module.exports = RecipesService;