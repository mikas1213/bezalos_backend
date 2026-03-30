import { Request, Response, NextFunction } from 'express';
const recentViews = new Map(); // Paprastas variantas (RAM), geriau naudoti Redis

export const checkRecentView = (req: Request, res: Response, next: NextFunction) => {
	const ip = req.ip;
	const { isSnippet } = req.body;
	const videoId = req.params.id;

	const key = `${ip}:${videoId}${isSnippet ? 'S' : 'F'}`;
	const now = Date.now();

	if (recentViews.has(key)) {
		const lastViewTime = recentViews.get(key);
		if (now - lastViewTime < 30 * 60 * 1000) {
			return res.status(200).json({ message: 'skipped' });
		}
	}

	recentViews.set(key, now);

	if (recentViews.size > 10000) recentViews.clear();

	next();
};
