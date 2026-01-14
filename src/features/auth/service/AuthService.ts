import { AuthRepository } from '../repositories/AuthRepository';
export class AuthService {
    private authRepository: AuthRepository;

    constructor(authRepository: AuthRepository) {
        this.authRepository = authRepository;
    }

    async login(email: string, password: string) {
        console.log('labas from login')
    }
}