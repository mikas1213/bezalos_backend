const BaseRepository = require('./BaseRepository');

class CommentsRepository extends BaseRepository {
    constructor(db) {
        super(db, 'comments');
    }
}

module.exports = CommentsRepository;