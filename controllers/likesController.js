const catchAsync = require('../utils/catchAsync');
const { LIKES_SERVICE } = require('../config/DIKeys');
const appContainer = require('../utils/appContainer');
const likesService = appContainer.resolve(LIKES_SERVICE);

exports.likesToggle = catchAsync(async (req, res) => {
	const { user_id } = req;
	const { category, entity_id } = req.body;
	const { likes_toggle } = await likesService.toggleLikes(user_id, category, entity_id);
	res.status(200).json(likes_toggle);
});
