import { container } from './Container';
import { Database } from '../common/config/db';
import { AuthRepository } from '../features/auth/repositories/AuthRepository';
import { AuthService } from '../features/auth/service/AuthService';
import { AuthController } from '../features/auth/controller/AuthController';
import { TokenService } from '../features/auth/service/TokenService';

container.register('Database', Database, [], true);
container.register('TokenService', TokenService, [], true);
container.register('AuthRepository', AuthRepository, ['Database'], true)
container.register('AuthService', AuthService, ['AuthRepository', 'TokenService'], true);
container.register('AuthController', AuthController, ['AuthService'], true);

export default container;