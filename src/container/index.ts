import { container } from './Container';
import { Database } from '../common/config/db';
import { EmailService } from '../common/email/EmailService';
import { TokenService } from '../features/auth/service/TokenService';
import { AuthRepository } from '../features/auth/repositories/AuthRepository';
import { AuthService } from '../features/auth/service/AuthService';
import { AuthController } from '../features/auth/controller/AuthController';
import { AuthMiddleware } from '../features/auth/middleware/AuthMiddleware';

container.register('Database', Database, [], true);
container.register('EmailService', EmailService, [], true);
container.register('TokenService', TokenService, [], true);
container.register('AuthRepository', AuthRepository, ['Database'], true)
container.register('AuthService', AuthService, ['AuthRepository', 'TokenService', 'EmailService'], true);
container.register('AuthController', AuthController, ['AuthService'], true);
container.register('AuthMiddleware', AuthMiddleware, ['TokenService'], true);

export default container;