import { Database } from '../common/config/db';
import { EmailService } from '../common/email/EmailService';
import { AuthRepository } from '../features/auth/repositories/AuthRepository';
import { AuthService } from '../features/auth/service/AuthService';
import { AuthController } from '../features/auth/controller/AuthController';
import { TokenService } from '../features/auth/service/TokenService';

export interface ContainerRegistry {
	Database: Database;
	EmailService: EmailService;
	TokenService: TokenService;
	AuthRepository: AuthRepository;
	AuthService: AuthService;
	AuthController: AuthController;
}
