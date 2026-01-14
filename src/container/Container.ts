export class Container<T extends Record<string, any>> {
	private services: Partial<T> = {};

	register<K extends keyof T>(name: K, instance: T[K]) {
		this.services[name] = instance;
	}

	resolve<K extends keyof T>(name: K): T[K] {
		const service = this.services[name];
		if (!service) {
			throw new Error(`Service '${String(name)}' not found.`);
		}
		return service;
	}
}
