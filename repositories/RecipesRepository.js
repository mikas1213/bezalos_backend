const BaseRepository = require('./BaseRepository');

class RecipesRepository extends BaseRepository {
    constructor(db) {
        const mapping = {d: 'duration'}
        super(db, 'recipes', mapping);
    }
}

module.exports = RecipesRepository;