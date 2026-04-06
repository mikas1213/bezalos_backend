import type { AdminVirtuveRepository } from './AdminVirtuveRepository';

export class AdminVirtuveService {
	constructor(private readonly adminVirtuveRepository: AdminVirtuveRepository) {}

	async getAllVideos() {
		return await this.adminVirtuveRepository.findAll();
	}
}
