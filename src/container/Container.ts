type ServiceName = string;
type Constructor<T = any> = new (...args: any[]) => T;
type Factory<T = any> = (...args: any[]) => T;
type Provider<T = any> = Constructor<T> | Factory<T> | Text;

interface ServiceEntry<T = any> {
	provider: Provider<T>;
	dependencies: ServiceName[];
	isSingleton: boolean;
	instance: T | null;
}

class Container {
	//   constructor() {
	//     this.services = new Map();
	//   }
    private services = new Map<ServiceName, ServiceEntry>();

	register<T>(name: ServiceName, ServiceProvider: Provider<T>, dependencies: ServiceName[] = [], isSingleton: boolean = false): void {
		if (this.services.has(name)) {
			console.warn(`Service '${name}' is being re-registered.`);
		}

		this.services.set(name, {
			provider: ServiceProvider,
			dependencies: dependencies,
			isSingleton: isSingleton,
			instance: null,
		});
	}

	resolve<T>(name: ServiceName, resolving = new Set<ServiceName>()): T {
		const serviceEntry = this.services.get(name);

		if (!serviceEntry) {
			throw new Error(`Service "${name}" not found.`);
		}

		if (resolving.has(name)) {
			throw new Error(`Circular dependency detected: ${name}`);
		}
		resolving.add(name);

		if (serviceEntry.isSingleton && serviceEntry.instance) {
			return serviceEntry.instance as T;
		}

		const resolvedDependencies = serviceEntry.dependencies.map(
			(depName) => {
				return this.resolve(depName, resolving);
			},
		);

		let serviceInstance: unknown;
		if (typeof serviceEntry.provider === 'function') {
			try {
				serviceInstance = new (serviceEntry.provider as Constructor)(
					...resolvedDependencies,
				);
			} catch (e) {
				serviceInstance = (serviceEntry.provider as Factory)(
					...resolvedDependencies,
				);
			}
		} else {
			serviceInstance = serviceEntry.provider;
		}

		if (serviceEntry.isSingleton) {
			serviceEntry.instance = serviceInstance as T;
		}

		return serviceInstance as T;
	}
}

export const container = new Container();
