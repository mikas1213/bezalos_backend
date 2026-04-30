'use strict';

// Known crawler User-Agent strings
const BOT_PATTERNS = [
    'Googlebot',
    'Twitterbot',
    'facebookexternalhit',
    'LinkedInBot',
    'Slackbot',
    'TelegramBot',
    'WhatsApp',
    'Discordbot',
    'Pinterest',
];

// Routes where bot detection should apply (regex)
const VIDEO_PAGE_REGEX = /^\/virtuve\/[^/]+$/;

exports.handler = async (event) => {
    const request = event.Records[0].cf.request;
    const userAgent = request.headers['user-agent']?.[0]?.value ?? '';
    const uri = request.uri;

    const isBot = BOT_PATTERNS.some((pattern) => userAgent.includes(pattern));
    const isVideoPage = VIDEO_PAGE_REGEX.test(uri);

    if (isBot && isVideoPage) {
        // Rewrite URI: /virtuve/:slug → /seo/virtuve/:slug
        // CloudFront must have a behavior for /seo/* pointing to the backend origin
        request.uri = `/seo${uri}`;
    }

    return request;
};
