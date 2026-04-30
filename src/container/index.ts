import { container } from './Container';
import { Database } from '../common/config/db';
import { EmailService } from '../common/email/EmailService';
import { TokenService } from '../features/auth/service/TokenService';
import { AuthRepository } from '../features/auth/repositories/AuthRepository';
import { AuthService } from '../features/auth/service/AuthService';
import { AuthController } from '../features/auth/controller/AuthController';
import { AuthMiddleware } from '../features/auth/middleware/AuthMiddleware';
import { AdminVirtuveController, AdminVirtuveService, AdminVirtuveRepository } from '../features/admin/virtuve';
import { LoginAttemptService } from '../features/auth/service/LoginAttemptService';
import { LoginRateLimiter } from '../features/auth/middleware/LoginRateLimiter';
import { SignupRateLimiter } from '../features/auth/middleware/SignupRateLimiter';
import { VirtuveRepository, VirtuveService, VirtuveController } from '../features/client/virtuve';
import { TagsRepository, TagsService, TagsController } from '../features/client/tags';
import { S3Service } from '../services/S3/S3Service';
import { LikesRepository, LikesService, LikesController, LikesMiddleware } from '../features/client/likes';
import { CommentsMiddleware, CommentsController, CommentsService, CommentsRepository } from '../features/client/comments';
import { SitemapController, SitemapService, SitemapRepository } from '../features/sitemap';
import { SeoController } from '../features/seo/SeoController';

container.register('Database', Database, [], true);
container.register('S3Service', S3Service, [], true);
container.register('EmailService', EmailService, [], true);
container.register('TokenService', TokenService, [], true);

container.register('TagsRepository', TagsRepository, ['Database'], true);
container.register('TagsService', TagsService, ['TagsRepository'], true);
container.register('TagsController', TagsController, ['TagsService'], true);

container.register('AuthRepository', AuthRepository, ['Database'], true);
container.register('AuthService', AuthService, ['AuthRepository', 'TokenService', 'EmailService'], true);
container.register('AuthController', AuthController, ['AuthService'], true);
container.register('AuthMiddleware', AuthMiddleware, ['TokenService', 'Database'], true);

container.register('AdminVirtuveRepository', AdminVirtuveRepository, ['Database'], true);
container.register('AdminVirtuveService', AdminVirtuveService, ['AdminVirtuveRepository'], true);
container.register('AdminVirtuveController', AdminVirtuveController, ['AdminVirtuveService'], true);

container.register('CommentsMiddleware', CommentsMiddleware, ['Database'], true);
container.register('CommentsRepository', CommentsRepository, ['Database'], true);
container.register('CommentsService', CommentsService, ['CommentsRepository'], true);
container.register('CommentsController', CommentsController, ['CommentsService'], true);

container.register('LikesMiddleware', LikesMiddleware, ['Database'], true);
container.register('LikesRepository', LikesRepository, ['Database'], true);
container.register('LikesService', LikesService, ['LikesRepository'], true);
container.register('LikesController', LikesController, ['LikesService'], true);

container.register('LoginAttemptService', LoginAttemptService, ['Database'], true);
container.register('LoginRateLimiter', LoginRateLimiter, ['LoginAttemptService'], true);
container.register('SignupRateLimiter', SignupRateLimiter, ['LoginAttemptService'], true);

container.register('VirtuveRepository', VirtuveRepository, ['Database'], true);
container.register('VirtuveService', VirtuveService, ['VirtuveRepository', 'S3Service'], true);
container.register('VirtuveController', VirtuveController, ['VirtuveService'], true);

container.register('SitemapRepository', SitemapRepository, ['Database'], true);
container.register('SitemapService', SitemapService, ['SitemapRepository'], true);
container.register('SitemapController', SitemapController, ['SitemapService'], true);

container.register('SeoController', SeoController, ['VirtuveService'], true);

export default container;
