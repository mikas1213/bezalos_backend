import { Database } from '../common/config/db';
import { S3Service } from '../services/S3/S3Service';
import { EmailService } from '../common/email/EmailService';
import { TokenService } from '../features/auth/service/TokenService';
import { AuthRepository } from '../features/auth/repositories/AuthRepository';
import { AuthService } from '../features/auth/service/AuthService';
import { AuthController } from '../features/auth/controller/AuthController';
import { AuthMiddleware } from '../features/auth/middleware/AuthMiddleware';
import { LoginAttemptService } from '../features/auth/service/LoginAttemptService';
import { LoginRateLimiter } from '../features/auth/middleware/LoginRateLimiter';
import { SignupRateLimiter } from '../features/auth/middleware/SignupRateLimiter';
import {
	AdminVideoMiddleware,
	AdminVirtuveController,
	AdminVirtuveService,
	AdminVirtuveRepository,
} from '../features/admin/virtuve';
import { VirtuveController, VirtuveService, VirtuveRepository } from '../features/client/virtuve';
import { TagsController, TagsService, TagsRepository } from '../features/tags';
import { LikesMiddleware, LikesController, LikesService, LikesRepository } from '../features/client/likes';
import { CommentsMiddleware, CommentsController, CommentsService, CommentsRepository } from '../features/client/comments';
import { SitemapController, SitemapService, SitemapRepository } from '../features/sitemap';
import { SeoController } from '../features/seo/SeoController';

export interface ContainerRegistry {
	Database: Database;
	S3Service: S3Service;
	EmailService: EmailService;
	TokenService: TokenService;
	AuthRepository: AuthRepository;
	AuthService: AuthService;
	AuthController: AuthController;
	AuthMiddleware: AuthMiddleware;
	LoginAttemptService: LoginAttemptService;
	LoginRateLimiter: LoginRateLimiter;
	SignupRateLimiter: SignupRateLimiter;
	AdminVideoMiddleware: AdminVideoMiddleware;
	AdminVirtuveController: AdminVirtuveController;
	AdminVirtuveService: AdminVirtuveService;
	AdminVirtuveRepository: AdminVirtuveRepository;
	VirtuveController: VirtuveController;
	VirtuveService: VirtuveService;
	VirtuveRepository: VirtuveRepository;
	TagsController: TagsController;
	TagsService: TagsService;
	TagsRepository: TagsRepository;
	LikesMiddleware: LikesMiddleware;
	LikesController: LikesController;
	LikesService: LikesService;
	LikesRepository: LikesRepository;
	CommentsMiddleware: CommentsMiddleware;
	CommentsController: CommentsController;
	CommentsService: CommentsService;
	CommentsRepository: CommentsRepository;
	SitemapRepository: SitemapRepository;
	SitemapService: SitemapService;
	SitemapController: SitemapController;
	SeoController: SeoController;
}
