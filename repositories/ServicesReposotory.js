const BaseRepository = require('./BaseRepository');

class ServicesRepository extends BaseRepository {
    constructor(db) {
        const mappings = { 'is_active': 'is_active' };
        super(db, 'services', mappings);
    }
}

module.exports = ServicesRepository;