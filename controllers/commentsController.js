const { COMMENTS_SERVICE } = require('../config/DIKeys');
const appContainer = require('../utils/appContainer');
const commentsService = appContainer.resolve(COMMENTS_SERVICE);
const catchAsync = require('../utils/catchAsync');

exports.addComment = catchAsync(async (req, res) => {
    
    const {id, video_id, user_id, user_name, comment} = req.body;
    await commentsService.addNewComment({id, video_id, user_id, user_name, comment});
    res.sendStatus(204);
});

exports.deleteComment = catchAsync(async (req, res) => {
    const { user_id, params: { id: comment_id } } = req;
    await commentsService.deleteComment(user_id, comment_id);
    res.sendStatus(204);
});