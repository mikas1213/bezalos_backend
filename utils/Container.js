class Container {
    constructor() {
        this.services = {};
    }
    register(name, instance) {
        this.services[name] = instance;
    }
    
    resolve(name) {
        if(!this.services[name]) {
            throw new Error(`Service '${name}' not found.`);
        }
        return this.services[name];
    }
}

module.exports = Container;